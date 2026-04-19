import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { roomDetailsRoute } from "../../app/router";
import "./RoomDetailsPage.css";
import { useState } from "react";
import { getUserData } from "../../services/userService";

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
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 40;

async function fetchSingleRoomDetails(
  getAuthToken: () => Promise<string | null>,
  roomId: string,
): Promise<RoomDetailsResponse> {
  const authToken = await getAuthToken();
  const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch room details");
  }

  const roomDetails = await response.json();
  return roomDetails;
}

function RoomDetailsPage() {
  const { roomId } = roomDetailsRoute.useParams();
  const { isSignedIn, getToken } = useAuth();

  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

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
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const data = await getUserData(token);
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
    const authToken = await getAuthToken();

    const response = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error("Failed to create booking");
    }

    return response.json();
  }

  function handleNameInput(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    // Handle form submission logic here
    if (
      name.trim().length < MIN_NAME_LENGTH ||
      name.trim().length > MAX_NAME_LENGTH
    ) {
      setError("Name must be between 2 and 40 characters");
      return;
    }

    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (!userId) {
      setError("No user ID");
      return;
    }

    const bookingData: BookingData = {
      start_time: startTime,
      end_time: endTime,
      user_id: userId,
      room_id: Number(roomId),
    };

    createBooking(getToken, bookingData)
      .then(() => {
        alert("Room booked successfully!");
        // Optionally, you can reset the form or redirect the user
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to book room. Please try again.");
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
                <label htmlFor="name" className="bookRoomLabel">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Full name"
                  className="bookRoomInput"
                  value={name}
                  onChange={handleNameInput}
                />
              </div>
              <div className="bookRoomField">
                <label htmlFor="startTime" className="bookRoomLabel">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="bookRoomInput"
                  onChange={(e) => setStartTime(e.target.value)}
                  value={startTime}
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
                  onChange={(e) => setEndTime(e.target.value)}
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
