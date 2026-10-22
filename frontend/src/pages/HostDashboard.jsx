import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [listingResponse, bookingResponse] = await Promise.all([
          api.get("/listings/my-listings"),
          api.get("/bookings/host-bookings")
        ]);
        if (!active) return;
        const ld = listingResponse.data;
        const bd = bookingResponse.data;
        setListings(Array.isArray(ld) ? ld : (ld.listings || ld.data?.listings || []));
        setBookings(Array.isArray(bd) ? bd : (bd.bookings || bd.data?.bookings || []));
      } catch (err) {
        if (active) setError(getApiError(err, "Could not load host dashboard. Make sure your account has the host role."));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function deleteListing(id) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(getApiError(err, "Could not delete this listing."));
    }
  }

  return (
    <main className="page-container">
      <div className="page-title-row"><div><p className="section-eyebrow">HOST TOOLS</p><h1>Host dashboard</h1></div><button className="auth-submit compact-button" onClick={() => navigate("/host/listings/new")}>+ Add listing</button></div>
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="status-message"><div className="loader" />Loading dashboard...</div> : <>
        <div className="dashboard-stats">
          <div className="stat-card"><span>Your listings</span><strong>{listings.length}</strong></div>
          <div className="stat-card"><span>Bookings received</span><strong>{bookings.length}</strong></div>
        </div>
        <h2 className="subheading">Your properties</h2>
        {listings.length ? <div className="host-listings">{listings.map((listing) =>
          <article className="host-listing-card" key={listing._id}>
            <div><h3>{listing.title}</h3><p className="muted">{listing.location}</p><p>₹{Number(listing.priceperNight || 0).toLocaleString("en-IN")} / night</p></div>
            <div className="inline-actions">
              <Link className="text-link" to={`/listings/${listing._id}`}>View</Link>
              <Link className="text-link" to={`/host/listings/${listing._id}/edit`}>Edit</Link>
              <button className="danger-button" onClick={() => deleteListing(listing._id)}>Delete</button>
            </div>
          </article>
        )}</div> : <div className="empty-state"><h3>No listings yet</h3><p>Add your first property to start hosting.</p></div>}
        <h2 className="subheading">Recent bookings</h2>
        {bookings.length ? <div className="table-wrap"><table><thead><tr><th>Property</th><th>Dates</th><th>Guests</th><th>Status</th><th>Total</th></tr></thead><tbody>{bookings.map((booking) =>
          <tr key={booking._id}><td>{booking.listing?.title || "Property"}</td><td>{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</td><td>{booking.guests}</td><td>{booking.status}</td><td>₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}</td></tr>
        )}</tbody></table></div> : <p className="muted">No bookings received yet.</p>}
      </>}
    </main>
  );
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
