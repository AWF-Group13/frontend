import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Link, Outlet } from "@tanstack/react-router";

type Props = {};

function AppShell(props: Props) {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
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
