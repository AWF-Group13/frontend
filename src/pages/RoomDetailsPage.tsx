import { useAuth } from "@clerk/react";
import { roomDetailsRoute } from "../app/router";
import { useQuery } from "@tanstack/react-query";

type Props = {};

const BASE_URL = import.meta.env.VITE_BASE_URL;

async function fetchSingleRoomDetails(
  getAuthToken: () => Promise<string | null>,
  roomId: string,
) {
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
  console.log("Fetched room details:", roomDetails);
  return roomDetails;
}

function RoomDetailsPage(props: Props) {
  const { roomId } = roomDetailsRoute.useParams();
  const { isSignedIn, isLoaded, getToken } = useAuth();

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
          <p>{roomDetails.room.features}</p>
        </div>
      )}
    </div>
  );
}

export default RoomDetailsPage;
