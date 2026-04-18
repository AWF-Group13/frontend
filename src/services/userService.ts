const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getUserData(token: string) {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // react query can handle this i.e. no try catch needed
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}
