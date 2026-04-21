import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import AppShell from "../pages/AppShell/AppShell";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminRoomsPage from "../pages/AdminRoomsPage";
import BookingsPage from "../pages/BookingsPage";
import HomePage from "../pages/HomePage";
import RoomsPage from "../pages/RoomsPage/RoomsPage";
import RoomDetailsPage from "../pages/RoomsPage/RoomDetailsPage";
import { getUserData } from "../services/userService";

type RouterContext = {
  // App.tsx gives this so routes can use auth and query client
  auth: {
    getToken: () => Promise<string | null>;
    isSignedIn: boolean;
  };
  queryClient: QueryClient;
};

const rootRoute = createRootRouteWithContext<RouterContext>()(); // 2 () for typed root route

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  component: AppShell,
});

const protectedRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected",
  beforeLoad: ({ context }) => {
    if (!context.auth.isSignedIn) {
      throw redirect({ to: "/" }); // not logged in? send to home page
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: "admin",
  beforeLoad: async ({ context }) => {
    const currentUser = await context.queryClient.ensureQueryData(
      {
        queryKey: ["currentUser"],
        queryFn: async () => {
          const data = await getUserData(context.auth.getToken);
          return data.user;
        },
      },
    );

    if (currentUser.role !== "admin") {
      throw redirect({ to: "/rooms" }); // not an admin? hop u r back to regular room page
    }
  },
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const roomsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "rooms",
  component: RoomsPage,
});

/* For viewing bookings */
export const bookingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "bookings",
  component: BookingsPage,
});

export const roomDetailsRoute = createRoute({
  // so RoomDetailsPage can use useParams
  getParentRoute: () => protectedRoute,
  path: "rooms/$roomId",
  component: RoomDetailsPage,
});

/* Admin room management */
const adminRoomsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "admin/rooms",
  component: AdminRoomsPage,
});

/* Admin view of bookings */
const adminBookingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "admin/bookings",
  component: AdminBookingsPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    protectedRoute.addChildren([
      roomsRoute.addChildren([roomDetailsRoute]),
      bookingsRoute,
      adminRoute.addChildren([adminRoomsRoute, adminBookingsRoute]),
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  context: undefined!, // App.tsx sets this when app run
});

declare module "@tanstack/react-router" {
  // helps typescript know the router
  interface Register {
    router: typeof router;
  }
}
