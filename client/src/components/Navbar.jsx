import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isAuthPage = ["/login", "/register", "/register-admin"].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🍽️</span>
        <Link to="/" className="navbar-title">TableReserve</Link>
      </div>

      <div className="navbar-links">
        {isAuthenticated && (
          <>
            <Link
              to="/reservations"
              className={`navbar-link ${isActive("/reservations") ? "active" : ""}`}
            >
              My Reservations
            </Link>
            <Link
              to="/reservations/new"
              className={`navbar-link ${isActive("/reservations/new") ? "active" : ""}`}
            >
              + New Booking
            </Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        {isAuthenticated ? (
          <>
            <span className="navbar-username">👤 {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`btn btn-outline btn-sm ${isActive("/login") ? "btn-active" : ""}`}>
              Sign in
            </Link>
            {}
            {!isAuthPage || location.pathname !== "/register" ? (
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            ) : null}
            <Link
              to="/register-admin"
              className="btn btn-admin btn-sm"
              title="Register as Administrator"
            >
              Admin
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
