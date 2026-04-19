import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import AppShell from "../pages/AppShell/AppShell";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminRoomsPage from "../pages/AdminRoomsPage";
import BookingsPage from "../pages/BookingsPage";
import HomePage from "../pages/HomePage";
import RoomsPage from "../pages/RoomsPage/RoomsPage";
import RoomDetailsPage from "../pages/RoomsPage/RoomDetailsPage";

const rootRoute = createRootRoute();

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  component: AppShell,
});

const protectedRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: "protected",
  beforeLoad: () => {
    const isSignedIn = true; // temporary for now

    if (!isSignedIn) {
      throw redirect({ to: "/" });
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: "admin",
  beforeLoad: () => {
    const role = "admin"; // temporary for now

    if (role !== "admin") {
      throw redirect({ to: "/rooms" });
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
});
