import { Link } from "@tanstack/react-router";
import "./RoomsPage.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import type { RoomRecord } from "../../admin/adminApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

async function fetchRooms(getAuthToken: () => Promise<string | null>) {
  const authToken = await getAuthToken();

  const response = await fetch(`${BASE_URL}/rooms`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  const data = await response.json();
  return data.rooms;
}

function RoomsPage() {
  const { getToken, isSignedIn } = useAuth();

  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetchRooms(getToken),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    return <div>Please sign in to view rooms.</div>;
  }
  if (error) {
    return <div>Error loading rooms</div>;
  }

  return (
    <>
      <h1>Rooms</h1>
      <div className="roomsGrid">
        {rooms?.map((room: RoomRecord) => (
          <Link to={`/rooms/${room.id}`} key={room.id}>
            <div className="roomCard">
              <h2>{room.name}</h2>
              <p>Capacity: {room.capacity}</p>

              {room.features?.map((feature: string, index: number) => (
                <div key={index}>{feature}</div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default RoomsPage;
