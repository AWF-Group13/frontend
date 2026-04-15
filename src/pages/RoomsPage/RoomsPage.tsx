import { Link } from "@tanstack/react-router";
import "./RoomsPage.css";

type Props = {};

const rooms = [
  {
    id: "a101",
    name: "Room A101",
    capacity: 6,
    features: ["Projector", "Whiteboard"],
  },
  {
    id: "f105",
    name: "Room F105",
    capacity: 10,
    features: ["TV", "Conference Phone"],
  },
];

function RoomsPage(props: Props) {
  return (
    <>
      <h1>Rooms</h1>
      <div className="roomsGrid">
        {rooms.map((room) => (
          <Link to={`/rooms/${room.id}`} key={room.id}>
            <div className="roomCard">
              <h2>{room.name}</h2>
              <p>Capacity: {room.capacity}</p>

              {room.features.map((feature, index) => (
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
