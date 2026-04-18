import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { roomDetailsRoute } from "../app/router";

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

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const {
    data: roomDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roomDetails", roomId],
    queryFn: () => fetchSingleRoomDetails(getToken, roomId),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    return <div>Please sign in to view room details.</div>;
  }
  if (error) {
    return <div>Error loading room details</div>;
  }

  const room = roomDetails?.room;

  return (
    <div>
      {room && (
        <div>
          <h1>{room.name ?? "Room"}</h1>

          {room.images && room.images.length > 0 ? (
            <img
              src={room.images[0].imageUrl}
              alt={`Room Image ${room.name}`}
            />
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
        </div>
      )}
    </div>
  );
}

export default RoomDetailsPage;
