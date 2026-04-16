import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="brand-icon">◆</span> EventHub
      </Link>
      <div className="nav-links">
        <Link to="/">Events</Link>
        {user ? (
          <>
            <Link to="/my-bookings">My Bookings</Link>
            {(user.role === "organizer" || user.role === "admin") && (
              <Link to="/dashboard">Dashboard</Link>
            )}
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <button className="btn-logout" onClick={handleLogout}>
              Logout ({user.name})
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}