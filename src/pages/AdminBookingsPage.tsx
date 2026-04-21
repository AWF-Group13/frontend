import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminBookings, type BookingRecord } from "../admin/adminApi";
import "./admin.css";

function formatDate(value: BookingRecord["start_time"]) {
  // date string so turn to something readable and this also handles nulls and dates that are not correct
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value; // if its not valid its raw string
  }

  return date.toLocaleString();
}

function AdminBookingsPage() {
  const { getToken } = useAuth();
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => fetchAdminBookings(getToken),
  });

  return (
    <div className="adminPage">
      <div className="adminHeader">
        <div>
          <h1>Admin Bookings</h1>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {error ? <div className="errorText">{error.message}</div> : null}

      {!isLoading && !error ? (
        bookings && bookings.length > 0 ? (
          <div className="adminTableWrapper">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User ID</th>
                  <th>Room ID</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.user_id ?? "-"}</td>
                    <td>{booking.room_id ?? "-"}</td>
                    <td>{formatDate(booking.start_time)}</td>
                    <td>{formatDate(booking.end_time)}</td>
                    <td>{booking.status ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="emptyState">No bookings found.</div>
        )
      ) : null}
    </div>
  );
}

export default AdminBookingsPage;
