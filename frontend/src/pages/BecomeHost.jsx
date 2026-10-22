import { useNavigate } from "react-router-dom";

export default function BecomeHost() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
          <p className="muted">Your current backend has host-only listing endpoints, but no host-upgrade endpoint was confirmed. To keep this page aligned with your backend, this page doesn't pretend to change your role.</p>
          <div className="notice-card">
            <h3>Host account required</h3>
            <p>To publish properties, your account must have the <code>host</code> role in the database. Once your backend supports a host-upgrade endpoint, we can connect this page to it.</p>
          </div>
          <button className="secondary-button" onClick={() => navigate("/")}>Back to stays</button>
        </>
      )}
    </main>
  );
}
