import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RegisterAdmin = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", adminSecret: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors([]);

    try {
      await registerAdmin(form);
      navigate("/admin/reservations", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || "Registration failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-container">
      <div className="auth-card admin-auth-card">
        <div className="admin-auth-banner">
          <span className="admin-auth-icon">🔐</span>
          <span className="admin-auth-label">Administrator Portal</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create Admin Account</h1>
          <p className="auth-subtitle">You&apos;ll need the Admin Secret Key from your system administrator</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            ⚠️ {error}
          </div>
        )}
        {fieldErrors.length > 0 && (
          <div className="alert alert-error" role="alert">
            <ul className="error-list">
              {fieldErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="admin-reg-name" className="form-label">Full name</label>
            <input
              id="admin-reg-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-reg-email" className="form-label">Email address</label>
            <input
              id="admin-reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              placeholder="admin@yourrestaurant.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-reg-password" className="form-label">
              Password <span className="form-hint">(min. 6 characters)</span>
            </label>
            <input
              id="admin-reg-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-reg-secret" className="form-label">
              Admin Secret Key
            </label>
            <div className="input-with-toggle">
              <input
                id="admin-reg-secret"
                type={showSecret ? "text" : "password"}
                name="adminSecret"
                value={form.adminSecret}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter the admin secret key"
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowSecret((s) => !s)}
                aria-label={showSecret ? "Hide secret" : "Show secret"}
              >
                {showSecret ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="form-hint">
              This key is set by the system administrator. Contact them if you don&apos;t have it.
            </p>
          </div>

          <button
            id="admin-register-submit"
            type="submit"
            className="btn btn-admin btn-full"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Admin Account"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">← Back to login</Link>
        </p>

        <div className="admin-auth-divider">
          <span>Are you a customer?</span>
        </div>
        <Link to="/register" className="btn btn-outline btn-full">
          Register as Customer
        </Link>
      </div>
    </div>
  );
};

export default RegisterAdmin;
