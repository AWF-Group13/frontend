import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";
import { Book } from "lucide-react";
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

  return (
    <div>
      <header>
        <nav>
          <Link to="/" aria-label="Home" className="homelink">
            <Book size={20} />
            Library logo
          </Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/bookings">Bookings</Link>
          {currentUser?.role === "admin" ? ( // just admins see links
            <>
              <Link to="/admin/rooms">Admin Rooms</Link>
              <Link to="/admin/bookings">Admin Bookings</Link>
            </>
          ) : null}
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
