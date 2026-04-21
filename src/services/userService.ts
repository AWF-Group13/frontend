import { authenticatedFetch, readErrorMessage } from "./apiReqService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export type User = {
  id: number;
  clerkUserId: string;
  role: string | null;
  createdAt: string | null;
};

type UserResponse = {
  user: User;
};

// Loads the signed-in user's record from the backend.
export async function getUserData(
  getAuthToken: () => Promise<string | null>,
): Promise<UserResponse> {
  const response = await authenticatedFetch(
    getAuthToken,
    `${BASE_URL}/users/me`,
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
