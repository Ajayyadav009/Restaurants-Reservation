import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      await register(form);
      navigate("/reservations", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || "Registration failed. Please try again.");
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
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Start making restaurant reservations</p>
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
            <label htmlFor="register-name" className="form-label">Full name</label>
            <input
              id="register-name"
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
            <label htmlFor="register-email" className="form-label">Email address</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="form-label">
              Password
              <span className="form-hint"> (min. 6 characters)</span>
            </label>
            <input
              id="register-password"
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

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
