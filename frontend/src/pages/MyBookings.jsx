import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getApiError } from "../services/api";

export default function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings/mybookings");
      const data = response.data;
      setBookings(Array.isArray(data) ? data : (data.bookings || data.data?.bookings || []));
    } catch (err) {
      setError(getApiError(err, "Could not load your bookings."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function cancelBooking(id) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/bookings/${id}/cancel`);
      await loadBookings();
    } catch (err) {
      setError(getApiError(err, "Could not cancel this booking."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="page-container">
      <div className="page-title-row"><div><p className="section-eyebrow">YOUR TRIPS</p><h1>My bookings</h1></div><Link className="secondary-button link-button" to="/">Find a stay</Link></div>
      {location.state?.message && <p className="form-success">{location.state.message}</p>}
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="status-message"><div className="loader" />Loading bookings...</div> :
        bookings.length ? <div className="booking-list">{bookings.map((booking) => {
          const listing = booking.listing || {};
          const id = booking._id;
          return <article className="booking-card" key={id}>
            <div className="booking-card-body">
              <h2>{listing.title || booking.listingTitle || "Your stay"}</h2>
              <p className="muted">{listing.location || "Location not available"}</p>
              <p><strong>Check-in:</strong> {formatDate(booking.checkIn)} &nbsp; <strong>Check-out:</strong> {formatDate(booking.checkOut)}</p>
              <p><strong>Guests:</strong> {booking.guests ?? "—"} · <strong>Total:</strong> ₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}</p>
              <span className={`status-pill ${String(booking.status).toLowerCase()}`}>{booking.status || "confirmed"}</span>
            </div>
            {String(booking.status).toLowerCase() !== "cancelled" &&
              <button className="danger-button" disabled={busyId === id} onClick={() => cancelBooking(id)}>
                {busyId === id ? "Cancelling..." : "Cancel booking"}
              </button>}
            {listing._id && <Link className="text-link" to={`/listings/${listing._id}`}>View property</Link>}
          </article>;
        })}</div> :
        <div className="empty-state"><span>✈</span><h3>No bookings yet</h3><p>When you reserve a stay, it will appear here.</p><Link className="secondary-button link-button" to="/">Explore stays</Link></div>
      }
    </main>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
