import { queryOptions } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

type GetToken = () => Promise<string | null>; // clerk gives this so we can get the auth token

async function fetchJson<T>( // makes sure each request sends auth token too
  url: string,
  getToken: GetToken,
  init?: RequestInit,
): Promise<T> {
  const authToken = await getToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      ...init?.headers, // let other headers add here
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (Array.isArray(data?.errors)) {
      return data.errors.join(", "); // some endpoints return errors as array
    }

    if (typeof data?.errors === "string") {
      return data.errors;
    }

    if (typeof data?.error === "string") {
      return data.error; // and some endpoints use "error" not "errors" idk why tbh
    }
  }

  const text = await response.text();
  return text || "Request failed"; // if nothing else i show this
}

export async function fetchCurrentUser(getToken: GetToken) {
  const data = await fetchJson<{ user: CurrentUser }>(
    `${BASE_URL}/users/me`,
    getToken,
  );

  return data.user;
}

export function currentUserQueryOptions(getToken: GetToken) { // will reuse for router and AppShell lol
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(getToken),
  });
}

export async function fetchAdminRooms(getToken: GetToken) {
  const data = await fetchJson<{ rooms: RoomRecord[] }>(
    `${BASE_URL}/rooms`,
    getToken,
  );

  return data.rooms;
}

export async function fetchAdminBookings(getToken: GetToken) {
  const data = await fetchJson<{ bookings: BookingRecord[] }>(
    `${BASE_URL}/bookings`,
    getToken,
  );

  return data.bookings;
}
