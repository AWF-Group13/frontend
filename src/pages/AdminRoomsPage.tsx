import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminRooms } from "../admin/adminApi";
import "./admin.css";

function AdminRoomsPage() {
  const { getToken } = useAuth();

  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: () => fetchAdminRooms(getToken),
  });

  return (
    <div className="adminPage">
      <div className="adminHeader">
        <div>
          <h1>Admin Rooms</h1>
          <p>Create, edit, and delete rooms.</p>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {error ? <div className="errorText">{error.message}</div> : null}

      {!isLoading && !error ? (
        rooms && rooms.length > 0 ? (
          <div className="adminTableWrapper">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Capacity</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.id}</td>
                    <td>{room.name ?? "Untitled room"}</td>
                    <td>{room.capacity ?? "-"}</td>
                    <td>
                      {Array.isArray(room.features) && room.features.length > 0 ? (
                        <ul className="featureList">
                          {room.features.map((feature) => (
                            <li key={`${room.id}-${feature}`}>{feature}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>No features</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="emptyState">No rooms found.</div>
        )
      ) : null}
    </div>
  );
}

export default AdminRoomsPage;
