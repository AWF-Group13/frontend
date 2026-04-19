import { useState } from "react";
import { bookingsRoute } from "../app/router";
import { authenticatedFetch } from "../services/apiReqService";
import { useAuth } from "@clerk/react";
import { getUserData } from "../services/userService";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div>
      <label htmlFor="bookingsForUser">Bookings for user: {userId}</label>
      <div className="allbookingsContainer">
        {bookings && bookings.length > 0 ? (
          bookings?.map((booking) => (
            <>
              <div key={booking.id}></div>
              <p>Booking Number: {booking.id}</p>
              <p>Room Id: {booking.room_id}</p>
              <p>Start Time: {booking.start_time}</p>
              <p>End Time: {booking.end_time}</p>
              <p>Status: {booking.status}</p>
            </>
          ))
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;
