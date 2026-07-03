import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

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
      const user = await login(form);
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === "admin" ? "/admin/reservations" : "/reservations", {
          replace: true,
        });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🍽️</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage your reservations</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {error}
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
            <label htmlFor="login-email" className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
