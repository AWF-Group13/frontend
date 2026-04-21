import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import { router } from "./app/router";

const queryClient = new QueryClient();

function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>; // clerk still loading... beep boop wait lol
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{ // get this context beforeLoad
          auth: {
            getToken,
            isSignedIn: Boolean(isSignedIn), // make it true or false
          },
          queryClient,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
