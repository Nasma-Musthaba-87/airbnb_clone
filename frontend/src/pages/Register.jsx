import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";
import { saveAuth } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password });
      if (saveAuth(response.data)) {
        navigate("/", { replace: true });
        window.location.reload();
      } else {
        navigate("/login", { replace: true, state: { message: "Registration successful. Please log in." } });
      }
    } catch (err) {
      setError(getApiError(err, "Unable to create your account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">⌂ StayFinder</div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Join StayFinder and discover your next stay.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <label htmlFor="name">Full name</label>
        <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label htmlFor="register-email">Email address</label>
        <input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="register-password">Password</label>
        <input id="register-password" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="auth-submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        <p className="auth-footer">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
