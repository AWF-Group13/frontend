import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  createRoomRequest,
  fetchAdminRooms,
  type RoomInput,
} from "../admin/adminApi";
import "./admin.css";

type RoomForm = {
  name: string;
  capacity: string; // turn to number when submit
  featuresText: string; // comma split into array
};

const initialRoomForm: RoomForm = { name: "", capacity: "", featuresText: "" };

function buildRoomInput(roomForm: RoomForm): RoomInput { // form fields > api
  return {
    name: roomForm.name.trim(),
    capacity: Number(roomForm.capacity),
    features: roomForm.featuresText
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean), // remove empty strings
  };
}

function AdminRoomsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [roomForm, setRoomForm] = useState<RoomForm>(initialRoomForm);
  const [formError, setFormError] = useState("");

  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: () => fetchAdminRooms(getToken),
  });

  const refreshRooms = async () => { // admin/public page update same time for room
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["adminRooms"] }),
      queryClient.invalidateQueries({ queryKey: ["rooms"] }),
    ]);
  };

  const createRoomMutation = useMutation({
    mutationFn: (roomInput: RoomInput) => createRoomRequest(getToken, roomInput),
    onSuccess: async () => {
      setRoomForm(initialRoomForm); // clean after saving
      setFormError("");
      await refreshRooms();
    },
    onError: (mutationError: Error) => {
      setFormError(mutationError.message);
    },
  });

  function resetForm() {
    setRoomForm(initialRoomForm);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const roomInput = buildRoomInput(roomForm);

    if (!roomInput.name) {
      setFormError("Name is required.");
      return;
    }

    if (!Number.isInteger(roomInput.capacity) || roomInput.capacity <= 0) {
      setFormError("Capacity must be a whole number greater than 0.");
      return;
    }

    await createRoomMutation.mutateAsync(roomInput);
  }

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
        <div className="adminLayout">
          <div>
            {rooms && rooms.length > 0 ? (
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
            )}
          </div>

          <form className="adminForm" onSubmit={handleSubmit}>
            <h2>Create Room</h2>

            <label htmlFor="room-name">
              Name
              <input
                id="room-name"
                value={roomForm.name}
                onChange={(event) =>
                  setRoomForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label htmlFor="room-capacity">
              Capacity
              <input
                id="room-capacity"
                type="number"
                min="1"
                step="1"
                value={roomForm.capacity}
                onChange={(event) =>
                  setRoomForm((currentForm) => ({
                    ...currentForm,
                    capacity: event.target.value,
                  }))
                }
              />
            </label>

            <label htmlFor="room-features">
              Features
              <textarea
                id="room-features"
                value={roomForm.featuresText}
                onChange={(event) =>
                  setRoomForm((currentForm) => ({
                    ...currentForm,
                    featuresText: event.target.value,
                  }))
                }
              />
            </label>

            {formError ? <p className="errorText">{formError}</p> : null}

            <div className="adminActions">
              <button type="submit" disabled={createRoomMutation.isPending}>
                Create Room
              </button>
              <button type="button" onClick={resetForm} disabled={createRoomMutation.isPending}>
                Clear
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default AdminRoomsPage;
