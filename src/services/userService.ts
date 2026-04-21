import { authenticatedFetch } from "./apiReqService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getUserData(getAuthToken: () => Promise<string | null>) {
  const response = await authenticatedFetch(
    getAuthToken,
    `${BASE_URL}/users/me`,
  );

  if (!response.ok) {
    // react query can handle this i.e. no try catch needed
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}
