import { Link, Outlet } from "@tanstack/react-router";

type Props = {};

function AppShell(props: Props) {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/rooms">Rooms</Link>
      </nav>
      {/* Actual rendering*/}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
