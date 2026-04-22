import { authenticatedFetch, readErrorMessage } from "./apiReqService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export type RoomRecord = {
  id: number;
  name: string | null;
  capacity: number | null;
  features: string[] | null;
  isBookable: boolean | null;
};

export type BookingRecord = {
  id: number;
  user_id: number | null;
  room_id: number | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
};

export type RoomInput = {
  name: string;
  capacity: number;
  features: string[];
};

// Wraps admin requests so every endpoint uses authenticatedFetch and consistent errors.
async function sendAdminRequest(
  getToken: () => Promise<string | null>,
  url: string,
  init?: RequestInit,
) {
  const response = await authenticatedFetch(getToken, url, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

// Small JSON helper for admin endpoints that return structured payloads.
async function fetchAdminJson<T>(
  getToken: () => Promise<string | null>,
  url: string,
  init?: RequestInit,
) {
  const response = await sendAdminRequest(getToken, url, init);
  return response.json() as Promise<T>;
}

// Admin room list used by the room management screen.
export async function fetchAdminRooms(getToken: () => Promise<string | null>) {
  const data = await fetchAdminJson<{ rooms: RoomRecord[] }>(
    getToken,
    `${BASE_URL}/rooms`,
  );

  return data.rooms;
}

// Admin booking list used by the bookings management screen.
export async function fetchAdminBookings(
  getToken: () => Promise<string | null>,
) {
  const data = await fetchAdminJson<{ bookings: BookingRecord[] }>(
    getToken,
    `${BASE_URL}/bookings`,
  );

  return data.bookings;
}

// Cancel booking by id from admin bookings.
export async function cancelBookingRequest(
  getToken: () => Promise<string | null>,
  bookingId: number,
) {
  await sendAdminRequest(getToken, `${BASE_URL}/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

// Create a room from the admin form payload.
export async function createRoomRequest(
  getToken: () => Promise<string | null>,
  roomInput: RoomInput,
) {
  await sendAdminRequest(getToken, `${BASE_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomInput),
  });
}

// Update an existing room from the admin form payload.
export async function updateRoomRequest(
  getToken: () => Promise<string | null>,
  roomId: number,
  roomInput: RoomInput,
) {
  await sendAdminRequest(getToken, `${BASE_URL}/rooms/${roomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomInput),
  });
}

// Delete a room by id from the admin table actions.
export async function deleteRoomRequest(
  getToken: () => Promise<string | null>,
  roomId: number,
) {
  await sendAdminRequest(getToken, `${BASE_URL}/rooms/${roomId}`, {
    method: "DELETE",
  });
}
