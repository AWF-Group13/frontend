import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";
import { Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getUserData } from "../../services/userService";
import "./AppShell.css";

function AppShell() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const data = await getUserData(getToken);
      return data.user;
    },
    enabled: isLoaded && isSignedIn, // check who is user if theyre actually logged in
  });
  const isAdmin = currentUser?.role === "admin"; // admin links show or not
  const links = [
    { to: "/rooms", icon: "/door.png", label: "Rooms" },
    { to: "/bookings", icon: "/calendar.png", label: "Bookings" },
  ];
  const adminLinks = [
    { to: "/admin/rooms", icon: "/shield.png", label: "Admin Rooms" },
    { to: "/admin/bookings", icon: "/clipboard.png", label: "Admin Bookings" },
  ];
  const renderLinks = (items: typeof links) => // helper so i dont repeat same thing
    items.map((item) => (
      isSignedIn ? (
        <Link
          key={item.to}
          to={item.to}
          className="menuLink"
          activeProps={{ className: "menuLink menuLinkCurrent" }}
        >
          <img src={item.icon} alt="" className="menuIcon" />
          {item.label}
        </Link>
      ) : (
        <SignInButton
          key={item.to}
          mode="redirect"
          fallbackRedirectUrl={item.to}
          signUpFallbackRedirectUrl={item.to}
        >
          <button type="button" className="menuLink menuLinkButton">
            <img src={item.icon} alt="" className="menuIcon" />
            {item.label}
          </button>
        </SignInButton>
      )
    ));

  return (
    <div>
      <header>
        <Link to="/" aria-label="Home" className="homeLink">
          <img src="/logo_greyishpng.png" alt="LibRoom logo" className="logoImage" />
          <span className="logoText">LibRoom</span>
        </Link>

        <nav className="menu">
          {renderLinks(links)}

          {isAdmin ? <span className="menuDivider" /> : null}

          {isAdmin ? renderLinks(adminLinks) : null}
        </nav>

        <div className="authButtons">
          <Show when="signed-out">
            <SignInButton />

            <SignUpButton />
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>
      {/* Actual rendering*/}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
