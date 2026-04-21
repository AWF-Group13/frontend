import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelBookingRequest, fetchAdminBookings, type BookingRecord } from "../services/adminService";
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
  const queryClient = useQueryClient();
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => fetchAdminBookings(getToken),
  });

  const cancelBooking = useMutation({
    mutationFn: (bookingId: number) => cancelBookingRequest(getToken, bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isCancelled = (booking.status ?? "").toLowerCase().includes("cancel");

                  return (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user_id ?? "-"}</td>
                      <td>{booking.room_id ?? "-"}</td>
                      <td>{formatDate(booking.start_time)}</td>
                      <td>{formatDate(booking.end_time)}</td>
                      <td>{booking.status ?? "-"}</td>
                      <td>
                        <button
                          type="button"
                          disabled={cancelBooking.isPending || isCancelled}
                          onClick={() => cancelBooking.mutate(booking.id)}
                        >
                          {isCancelled ? "Cancelled" : "Cancel"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="emptyState">No bookings found.</div>
        )
      ) : null}

      {cancelBooking.error ? (
        <div className="errorText">{cancelBooking.error.message}</div>
      ) : null}
    </div>
  );
}

export default AdminBookingsPage;
