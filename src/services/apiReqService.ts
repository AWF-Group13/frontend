/* This function authenticatedFetch is used to make authenticated API requests
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

// Normalizes API error payloads because different endpoints return different shapes.
export async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (Array.isArray(data?.errors)) {
      return data.errors.join(", ");
    }

    if (typeof data?.errors === "string") {
      return data.errors;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }
  }

  const text = await response.text();
  return text || "Request failed";
}
