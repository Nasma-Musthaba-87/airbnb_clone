import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";
import { saveAuth } from "../utils/auth";

export default function BecomeHost() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgradeToHost() {
    setError("");
    setLoading(true);

    try {
      const response = await api.patch("/auth/become-host");

      
      saveAuth(response.data);
      window.location.href = "/host/dashboard";
    } catch (err) {
      setError(getApiError(err, "Could not upgrade your account."));
      setLoading(false);
    }
  }

  return (
    <main className="page-container narrow-page">
      <p className="section-eyebrow">HOST WITH STAYFINDER</p>
      <h1>Share your space with the world.</h1>
      {role === "host" ? (
        <>
          <p>You already have a host account.</p>
          <button className="auth-submit" onClick={() => navigate("/host/dashboard")}>Open host dashboard</button>
        </>
      ) : (
        <>
          <p className="muted">Turn your account into a host account to list properties and see the bookings you receive. You can still book stays as a guest.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="auth-submit" onClick={upgradeToHost} disabled={loading}>
            {loading ? "Upgrading..." : "Become a host"}
          </button>
        </>
      )}
    </main>
  );
}