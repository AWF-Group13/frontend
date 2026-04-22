import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  createRoomRequest,
  deleteRoomRequest,
  fetchAdminRooms,
  type RoomInput,
  type RoomRecord,
  updateRoomRequest,
} from "../services/adminService";
import "./admin.css";

type FormMode = "create" | "edit"; // tracks whether the form is making a new room or changing one

type RoomForm = {
  name: string;
  capacity: string; // turn to number when submit
  roomImageURL: string;
  featuresText: string; // comma split into array
};

const initialRoomForm: RoomForm = {
  name: "",
  capacity: "",
  roomImageURL: "",
  featuresText: "",
};

function buildRoomForm(room: RoomRecord): RoomForm {
  // form fields > api
  return {
    name: room.name ?? "",
    capacity: room.capacity?.toString() ?? "",
    roomImageURL: room.roomImageURL ?? "",
    featuresText: Array.isArray(room.features) ? room.features.join(", ") : "",
  };
}

function buildRoomInput(roomForm: RoomForm): RoomInput {
  // form fields > api
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
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null); // which room id we are editing right now
  const [roomForm, setRoomForm] = useState<RoomForm>(initialRoomForm);
  const [formError, setFormError] = useState("");
  const [imageURL, setImageURL] = useState<string>("");

  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminRooms"],
    queryFn: () => fetchAdminRooms(getToken),
  });

  const refreshRooms = async () => {
    // admin/public page update same time for room
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["adminRooms"] }),
      queryClient.invalidateQueries({ queryKey: ["rooms"] }),
    ]);
  };

  const createRoomMutation = useMutation({
    mutationFn: (roomInput: RoomInput) =>
      createRoomRequest(getToken, roomInput),
    onSuccess: async () => {
      setRoomForm(initialRoomForm); // clean after saving
      setFormError("");
      await refreshRooms();
    },
    onError: (mutationError: Error) => {
      setFormError(mutationError.message);
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: (roomInput: RoomInput) =>
      updateRoomRequest(getToken, editingRoomId as number, roomInput),
    onSuccess: async () => {
      setFormMode("create"); // go back to create mode after saving changes
      setEditingRoomId(null);
      setRoomForm(initialRoomForm);
      setFormError("");
      await refreshRooms();
    },
    onError: (mutationError: Error) => {
      setFormError(mutationError.message);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: number) => deleteRoomRequest(getToken, roomId),
    onSuccess: async (_data, roomId) => {
      if (editingRoomId !== null && editingRoomId === roomId) {
        // deleted the room we were editing? reset the form
        setFormMode("create");
        setEditingRoomId(null);
        setRoomForm(initialRoomForm);
      }

      await refreshRooms();
    },
  });

  function resetForm() {
    setFormMode("create");
    setEditingRoomId(null);
    setRoomForm(initialRoomForm);
    setFormError("");
  }

  function startEditing(room: RoomRecord) {
    // fills form with data from whicever u choose so you can change it
    setFormMode("edit");
    setEditingRoomId(room.id);
    setRoomForm(buildRoomForm(room));
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

    if (formMode === "edit") {
      if (editingRoomId === null) {
        // shouldnt happen but just in case
        setFormError("No room selected for editing.");
        return;
      }

      await updateRoomMutation.mutateAsync(roomInput);
      return;
    }

    await createRoomMutation.mutateAsync(roomInput);
  }

  const isSaving = createRoomMutation.isPending || updateRoomMutation.isPending; // true when save in progress

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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td>{room.id}</td>
                        <td>{room.name ?? "Untitled room"}</td>
                        <td>{room.capacity ?? "-"}</td>
                        <td>
                          {Array.isArray(room.features) &&
                          room.features.length > 0 ? (
                            <ul className="featureList">
                              {room.features.map((feature) => (
                                <li key={`${room.id}-${feature}`}>{feature}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>No features</span>
                          )}
                        </td>
                        <td>
                          <div className="adminActions">
                            <button
                              type="button"
                              onClick={() => startEditing(room)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoomMutation.mutate(room.id)}
                              disabled={deleteRoomMutation.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="emptyState">No rooms found.</div>
            )}

            {deleteRoomMutation.error ? (
              <p className="errorText">{deleteRoomMutation.error.message}</p>
            ) : null}
          </div>

          <form className="adminForm" onSubmit={handleSubmit}>
            <h2>{formMode === "edit" ? "Edit Room" : "Create Room"}</h2>

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

            <label htmlFor="image-url">
              Room Image URL
              <input
                id="image-url"
                value={imageURL}
                onChange={(event) => setImageURL(event.target.value)}
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
              <button type="submit" disabled={isSaving}>
                {formMode === "edit" ? "Save Changes" : "Create Room"}
              </button>
              <button type="button" onClick={resetForm} disabled={isSaving}>
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
