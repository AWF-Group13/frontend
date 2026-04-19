export type CurrentUser = { // from GET /users/me
  id: number;
  clerkUserId: string;
  role: string | null; // null means no role assigned yet
  createdAt: string | null;
};

export type RoomRecord = { // what each room looks like from the api
  id: number;
  name: string | null;
  capacity: number | null;
  features: string[] | null; // things like "whiteboard", "projector" etc
  isBookable: boolean | null;
};

export type BookingRecord = { // what each booking looks like from the api
  id: number;
  user_id: number | null;
  room_id: number | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
};

export type RoomInput = { // the shape we need to send when creating or updating a room
  name: string;
  capacity: number;
  features: string[];
};
