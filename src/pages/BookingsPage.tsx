import { authenticatedFetch } from "../services/apiReqService";
import { useAuth } from "@clerk/react";
import { getUserData } from "../services/userService";
import { useQuery } from "@tanstack/react-query";
import "./BookingsPage.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

type Booking = {
  id: number;
  user_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  status: string | null;
};

function BookingsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Need the user id for post req
  const {
    data: user,
    isLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const data = await getUserData(getToken);
      return data.user;
    },
    enabled: isSignedIn,
  });

  const userId = user?.id;

  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["bookings", userId],
    queryFn: async (): Promise<Booking[]> => {
      const response = await authenticatedFetch(
        getToken,
        `${BASE_URL}/bookings/user/${userId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user bookings");
      }
      const data = await response.json();
      return data.bookings;
    },
    enabled: !!userId,
  });

  if (isLoading || bookingsLoading) {
    return <div>Loading...</div>;
  }
  if (!isLoaded) {
    return <div>Authenticating...</div>;
  }
  if (!isSignedIn) {
    return <div>Please sign in to view room details.</div>;
  }
  if (userError) {
    return <div>Error loading user</div>;
  }
  if (bookingsError) {
    return <div>Error loading bookings</div>;
  }

  // Adapted from a Stack Overflow answer by ajeet kanojia:
  // https://stackoverflow.com/a/34015511
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  function formatDate(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, dateFormatOptions);
    } catch {
      return isoString;
    }
  }

  return (
    <div className="bookingsPageContainer">
      <h1 className="bookingsPageTitle">Your Bookings</h1>
      <p className="bookingsSubtitle">User ID: {userId}</p>

      <div className="allBookingsContainer">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="bookingCard">
              <div className="bookingCardHeader">
                <span className="bookingId">Booking #{booking.id}</span>
                <span className="bookingStatus">
                  {booking.status || "Unknown"}
                </span>
              </div>
              <div className="bookingCardBody">
                <p>
                  <strong>Room ID:</strong> {booking.room_id}
                </p>
                <p>
                  <strong>Starts:</strong> {formatDate(booking.start_time)}
                </p>
                <p>
                  <strong>Ends:</strong> {formatDate(booking.end_time)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="noBookingsMsg">No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;
