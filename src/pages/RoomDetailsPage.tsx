import { roomDetailsRoute } from "../app/router";

type Props = {};

function RoomDetailsPage(props: Props) {
  const { roomId } = roomDetailsRoute.useParams();
  return <div>RoomDetailsPage {roomId}</div>;
}

export default RoomDetailsPage;
