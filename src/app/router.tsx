import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import AppShell from "../pages/AppShell";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminRoomsPage from "../pages/AdminRoomsPage";
import BookingsPage from "../pages/BookingsPage";
import HomePage from "../pages/HomePage";
import RoomsPage from "../pages/RoomsPage";

const rootRoute = createRootRoute();

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  component: AppShell,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const roomsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "rooms",
  component: RoomsPage,
});

/* For viewing bookings */
const bookingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "bookings",
  component: BookingsPage,
});

/* Admin room management */
const adminRoomsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "admin/rooms",
  component: AdminRoomsPage,
});

/* Admin view of bookings */
const adminBookingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "admin/bookings",
  component: AdminBookingsPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    roomsRoute,
    bookingsRoute,
    adminRoomsRoute,
    adminBookingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
