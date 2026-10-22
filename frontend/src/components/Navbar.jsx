import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuth, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = localStorage.getItem("role");

  function logout() {
    clearAuth();
    navigate("/");
    window.location.reload();
  }

  function accountAction() {
    if (!loggedIn) navigate("/login");
    else navigate("/mybookings");
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="StayFinder home">
        <span className="brand-icon">⌂</span><span>StayFinder</span>
      </Link>

      <nav className="main-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Stays
        </NavLink>
        {loggedIn && (
          <NavLink to="/mybookings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            My bookings
          </NavLink>
        )}
        {loggedIn && role === "host" && (
          <NavLink to="/host/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Host dashboard
          </NavLink>
        )}
      </nav>

      <div className="header-right">
        {loggedIn ? (
          <>
            {role !== "host" && <button className="host-button" onClick={() => navigate("/become-a-host")}>Become a host</button>}
            <button className="user-menu" onClick={accountAction} aria-label="Open account">
              <span>☰</span><span className="user-avatar">●</span>
            </button>
            <button className="text-button logout-button" onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <button className="host-button" onClick={() => navigate("/login")}>Become a host</button>
            <button className="user-menu" onClick={accountAction} aria-label="Open account">
              <span>☰</span><span className="user-avatar">●</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
