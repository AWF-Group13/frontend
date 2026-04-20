import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Book } from "lucide-react";
import { Link, Outlet } from "@tanstack/react-router";
import "./AppShell.css";

function AppShell() {
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
