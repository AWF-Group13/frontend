import { Link } from "@tanstack/react-router";
import "./HomePage.css";

function HomePage() {
  return (
    <>
      <section className="welcome">
        <p>OPEN 24/7</p>
        <h1>Welcome to LibRoom</h1>
        <p>Find a quiet place to study, meet, or work anytime.</p>
        <div>
          <Link to="/rooms" className="search">
            <img src="/search.png" alt="" width="22" height="22" />
            Find a Room
          </Link>
          <Link to="/bookings" className="bookings">
            <img src="/calendar.png" alt="" width="22" height="22" />
            View My Bookings
          </Link>
        </div>
      </section>
      <div className="boxes">
        <div className="box">
          <img src="/time.png" alt="" width="48" height="48" />
          <div>
            <b>Open 24/7</b>
            <br />
            Reserve a room anytime, day or night.
          </div>
        </div>
        <div className="box">
          <img src="/book.png" alt="" width="48" height="48" />
          <div>
            <b>Quiet Spaces</b>
            <br />
            Find a calm room when you need to focus.
          </div>
        </div>
        <div className="box">
          <img src="/room.png" alt="" width="48" height="48" />
          <div>
            <b>Group Study</b>
            <br />
            Book a space for meetings, projects, or study sessions.
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
