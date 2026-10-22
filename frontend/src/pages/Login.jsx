import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";
import { saveAuth } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (!saveAuth(response.data)) {
        throw new Error("Login succeeded but the response did not include a token. Check the backend login response.");
      }
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      setError(getApiError(err, "Unable to log in."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">⌂ StayFinder</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to continue planning your next stay.</p>
        {location.state?.message && <p className="form-success">{location.state.message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="auth-submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
        <p className="auth-footer">New to StayFinder? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
