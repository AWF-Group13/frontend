import { useAuth } from "@clerk/react";
import { roomDetailsRoute } from "../app/router";
import { useQuery } from "@tanstack/react-query";
import type { RoomRecord } from "../admin/adminApi";

type RoomDetailsResponse = { // typed so we know how the api response
  room: RoomRecord;
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

  return (
    <div>
      {roomDetails && (
        <div>
          <p>{roomDetails.room.name}</p>
          <p>{roomDetails.room.features?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default RoomDetailsPage;
