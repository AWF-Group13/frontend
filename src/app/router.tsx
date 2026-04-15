import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import AppShell from "../pages/AppShell";
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

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([homeRoute, roomsRoute]),
]);

export const router = createRouter({
  routeTree,
});
