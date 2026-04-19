import { Link } from "@tanstack/react-router";
import "./RoomsPage.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

type RoomImageResponse = {
  id: number;
  roomId: number;
  imageUrl: string;
};

type RoomResponse = {
  id: number;
  name: string | null;
  capacity: number | null;
  features: string[] | null;
  isBookable: boolean | null;
  images?: RoomImageResponse[];
};

async function fetchRooms(
  getAuthToken: () => Promise<string | null>,
): Promise<RoomResponse[]> {
  const authToken = await getAuthToken();

  const response = await fetch(`${BASE_URL}/rooms`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  const data: { rooms: RoomResponse[] } = await response.json();
  return data.rooms;
}

function RoomsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

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
  if (!isLoaded) {
    return <div> Authenticating...</div>;
  }
  if (error) {
    return <div>Error loading rooms</div>;
  }

  const MAX_FEATURES = 3;

  return (
    <div className="roomsPageContainer">
      <h1 className="roomsPageTitle">Rooms</h1>
      <div className="roomsGrid">
        {rooms?.map((room) => {
          // Get the features to display (up to MAX_FEATURES)
          const displayedFeatures = room.features?.slice(0, MAX_FEATURES) || [];
          // Calculate how many extra features there are beyond the displayed ones
          const extraFeaturesCount =
            (room.features?.length || 0) - MAX_FEATURES;

          return (
            <Link to={`/rooms/${room.id}`} key={room.id}>
              <div className="roomCard">
                <div className="roomCardImageContainer">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0].imageUrl}
                      alt={room.name || "Room"}
                      className="roomCardImage"
                    />
                  ) : (
                    <div className="roomCardPlaceholder">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className="roomCardContent">
                  <div className="roomCardHeader">
                    <h2 className="roomCardName">{room.name}</h2>
                    <p className="roomCardCapacity">
                      Capacity: {room.capacity}
                    </p>
                  </div>

                  <div className="roomCardFeaturesSection">
                    <p className="roomCardFeaturesTitle">This room has:</p>
                    <ul className="roomCardFeatures">
                      {displayedFeatures.map(
                        (feature: string, index: number) => (
                          <li key={index} className="roomCardFeatureItem">
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                    {extraFeaturesCount > 0 && (
                      <div className="roomCardFeatureItem moreFeatures">
                        + {extraFeaturesCount} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RoomsPage;
