import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/admin/reservations",
    icon: "📋",
    label: "All Reservations",
    id: "sidebar-reservations",
  },
  {
    to: "/admin/tables",
    icon: "🪑",
    label: "Manage Tables",
    id: "sidebar-tables",
  },
];


const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-shell">
      {}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">🍽️</span>
          <div>
            <p className="sidebar-brand">TableReserve</p>
            <span className="sidebar-role-tag">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              id={item.id}
              to={item.to}
              className={`sidebar-link ${isActive(item.to) ? "sidebar-link-active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-email">{user?.email}</p>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {}
      <div className="admin-content">
        <header className="admin-topbar">
          <h2 className="admin-topbar-title">
            {NAV_ITEMS.find((n) => isActive(n.to))?.label || "Admin"}
          </h2>
          <div className="admin-topbar-right">
            <span className="admin-badge">⚙️ Administrator</span>
          </div>
        </header>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
