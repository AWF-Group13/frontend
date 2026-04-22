import { useAuth } from "@clerk/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { roomDetailsRoute } from "../../app/router";
import "./RoomDetailsPage.css";
import { useState } from "react";
import { getUserData } from "../../services/userService";
import { authenticatedFetch } from "../../services/apiReqService";
import { convertTimeToMs } from "../../services/utils";

type RoomImage = {
  id: number;
  imageUrl: string;
};

type Room = {
  id: number;
  name: string | null;
  capacity: number | null;
  features: string[] | null;
  isBookable: boolean | null;
  images?: RoomImage[];
};

type RoomDetailsResponse = {
  room: Room;
};

// Data sent to book the room
type BookingData = {
  start_time: string;
  end_time: string;
  user_id: number;
  room_id: number;
};

const BASE_URL = import.meta.env.VITE_BASE_URL;
const MAX_BOOKING_HOURS = 2; // for a day? or until other booking expires?
const MAX_BOOKING_DAYS_AHEAD = 7; // how far in advance can a booking be made?

function toDateTimeLocalValue(date: Date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

async function fetchSingleRoomDetails(
  getAuthToken: () => Promise<string | null>,
  roomId: string,
): Promise<RoomDetailsResponse> {
  const response = await authenticatedFetch(
    getAuthToken,
    `${BASE_URL}/rooms/${roomId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch room details");
  }

  const roomDetails = await response.json();
  return roomDetails;
}

function RoomDetailsPage() {
  const { roomId } = roomDetailsRoute.useParams();
  const { isSignedIn, getToken } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const now = new Date();
  const maxDate = new Date(
    now.getTime() + convertTimeToMs(MAX_BOOKING_DAYS_AHEAD, "days"),
  );
  const startMin = toDateTimeLocalValue(now);
  const startMax = toDateTimeLocalValue(maxDate);
  const endMin = startTime || startMin;
  const endMax = (() => {
    const maxEndDate = new Date(startMax);

    if (!startTime) {
      return startMax;
    }

    const selectedStart = new Date(startTime);
    if (Number.isNaN(selectedStart.getTime())) {
      return startMax;
    }

    const startPlusMaxHours = new Date(
      selectedStart.getTime() + convertTimeToMs(MAX_BOOKING_HOURS, "hours"),
    );
    const effectiveMax =
      startPlusMaxHours < maxEndDate ? startPlusMaxHours : maxEndDate;

    return toDateTimeLocalValue(effectiveMax);
  })();

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: BookingData) =>
      createBooking(getToken, bookingData),
    onSuccess: () => {
      alert("Room booked successfully!");
    },
    onError: (err) => {
      console.error(err);
      setError("Failed to book room. Please try again.");
    },
  });

  const {
    data: roomDetails,
    isLoading,
    error: roomError,
  } = useQuery({
    queryKey: ["roomDetails", roomId],
    queryFn: () => fetchSingleRoomDetails(getToken, roomId),
  });

  // Need the user id for post req
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const data = await getUserData(getToken);
      return data.user;
    },
    enabled: isSignedIn,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    return <div>Please sign in to view room details.</div>;
  }
  if (roomError) {
    return <div>Error loading room details</div>;
  }
  const userId = user?.id;
  // Function to create a booking for the room
  // Takes the booking data and sends a POST request to the backend
  async function createBooking(
    getAuthToken: () => Promise<string | null>,
    bookingData: BookingData,
  ) {
    const response = await authenticatedFetch(
      getAuthToken,
      `${BASE_URL}/bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create booking");
    }

    return response.json();
  }

  function handleStartTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const tempStartTime = event.target.value; // temporary var to validate before setting state

    if (!tempStartTime) {
      setStartTime("");
      return;
    }

    if (new Date(tempStartTime) < new Date()) {
      setError("Start time cannot be in the past.");
      setStartTime("");
      return;
    }

    if (endTime && new Date(endTime) <= new Date(tempStartTime)) {
      setStartTime(tempStartTime);
      setError("End time must be after start time.");
      setEndTime("");
      return;
    }

    if (
      endTime &&
      new Date(endTime).getTime() - new Date(tempStartTime).getTime() >
        convertTimeToMs(MAX_BOOKING_HOURS, "hours")
    ) {
      setStartTime(tempStartTime);
      setError(
        `End time cannot be more than ${MAX_BOOKING_HOURS} hours after start time.`,
      );
      setEndTime("");
      return;
    }

    setError(null);
    setStartTime(tempStartTime);
  }

  function handleEndTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const tempEndTime = event.target.value;

    if (!tempEndTime) {
      setEndTime("");
      return;
    }

    if (new Date(tempEndTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      setEndTime("");
      return;
    }

    if (
      new Date(tempEndTime).getTime() - new Date(startTime).getTime() >
      convertTimeToMs(MAX_BOOKING_HOURS, "hours")
    ) {
      setError(
        `End time cannot be more than ${MAX_BOOKING_HOURS} hours after start time.`,
      );
      setEndTime("");
      return;
    }

    setError(null);
    setEndTime(tempEndTime);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }

    if (new Date(startTime) < new Date()) {
      setError("Start time cannot be in the past.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (
      new Date(endTime).getTime() - new Date(startTime).getTime() >
      convertTimeToMs(MAX_BOOKING_HOURS, "hours")
    ) {
      setError(
        `End time cannot be more than ${MAX_BOOKING_HOURS} hours after start time.`,
      );
      return;
    }

    if (!userId) {
      setError("No user ID");
      return;
    }

    createBookingMutation.mutate({
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      user_id: userId,
      room_id: Number(roomId),
    });
  }

  const room = roomDetails?.room;

  return (
    <div>
      {room && (
        <div>
          <h1>{room.name ?? "Room"}</h1>

          {room.images && room.images.length > 0 ? (
            <div className="roomImageContainer">
              <img
                src={room.images[0].imageUrl}
                alt={`Room Image ${room.name}`}
              />
            </div>
          ) : null}

          <p>Capacity: {room.capacity ?? ""}</p>
          <p>Available to book: {room.isBookable ? "Yes" : "No"}</p>

          <div>
            <h2>Features</h2>
            {room.features && room.features.length > 0 ? (
              <ul>
                {room.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p>No features listed.</p>
            )}
          </div>
          {/* <!---------- Booking form ---------> */}
          <div className="bookRoomSection">
            <h2>Book Room</h2>
            <form className="bookRoomForm" onSubmit={handleSubmit}>
              <div className="bookRoomField">
                {error && <pre className="bookRoomError">{error}</pre>}
              </div>
              <div className="bookRoomField">
                <label htmlFor="startTime" className="bookRoomLabel">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="bookRoomInput"
                  onChange={handleStartTimeChange}
                  value={startTime}
                  min={startMin}
                  max={startMax}
                />
              </div>
              <div className="bookRoomField">
                <label htmlFor="endTime" className="bookRoomLabel">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className="bookRoomInput"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  min={endMin}
                  max={endMax}
                />
              </div>
              <button type="submit">Book Room</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomDetailsPage;
