/* This function is used to make authenticated API requests
 * It takes a function to get the token, the URL, and the options for the fetch request
 * It returns the response from the fetch request
 * Parameters:
 * getToken: a function that returns a promise that resolves to a string (the token) or null
 * url: the URL to make the request to
 * options: the options for the fetch request (method, headers, body, etc.)
 * */
export async function authenticatedFetch(
  getToken: () => Promise<string | null>,
  url: string,
  options: RequestInit = {},
) {
  const token = await getToken();
  if (!token) {
    throw new Error("No Auth token found");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
