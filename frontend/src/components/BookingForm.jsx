import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";
import { requireLogin } from "../utils/auth";

export default function BookingForm({ listing }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toLocaleDateString("en-CA");
  const nights = checkIn && checkOut
    ? Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000)
    : 0;
  const priceperNight = Number(listing.priceperNight || 0);
  const total = nights > 0 ? nights * priceperNight : 0;
  const maxGuests = Math.max(1, Number(listing.maxGuests) || 1);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!requireLogin(navigate, "Please log in before booking a property.")) return;
    if (!checkIn || !checkOut) return setError("Select check-in and check-out dates.");
    if (nights <= 0) return setError("Check-out must be after check-in.");
    if (checkIn < today) return setError("Check-in cannot be in the past.");
    if (guests < 1 || guests > maxGuests) return setError(`Choose 1 to ${maxGuests} guests.`);

    setLoading(true);
    try {
      // Backend availability response is treated defensively because its exact shape can vary.
      const availability = await api.get("/bookings/availability", {
        params: { listingId: listing._id, checkIn, checkOut }
      });
      const a = availability.data;
      const explicitlyUnavailable =
        a?.available === false || a?.isAvailable === false ||
        a?.data?.available === false || a?.data?.isAvailable === false;

      if (explicitlyUnavailable) {
        setError("This property is not available for the selected dates.");
        return;
      }

      const response = await api.post("/bookings", {
        listingId: listing._id,
        checkIn,
        checkOut,
        guests: Number(guests)
      });

      setSuccess(response.data?.message || "Booking created successfully!");
      window.setTimeout(() => navigate("/mybookings", {
        state: { message: "Your booking was created successfully." }
      }), 900);
    } catch (err) {
      setError(getApiError(err, "Booking failed. Check the dates and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="booking-preview">
      <h2>₹{priceperNight.toLocaleString("en-IN")} <span>/ night</span></h2>
      <form onSubmit={submit}>
        <div className="booking-date-grid">
          <div><label htmlFor="checkIn">CHECK-IN</label>
            <input id="checkIn" type="date" min={today} value={checkIn} required
              onChange={(e) => { setCheckIn(e.target.value); setError(""); }} /></div>
          <div><label htmlFor="checkOut">CHECK-OUT</label>
            <input id="checkOut" type="date" min={checkIn || today} value={checkOut} required
              onChange={(e) => { setCheckOut(e.target.value); setError(""); }} /></div>
        </div>
        <div className="booking-guests">
          <label htmlFor="booking-guests">GUESTS</label>
          <select id="booking-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) =>
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            )}
          </select>
        </div>
        {nights > 0 && (
          <div className="booking-price-breakdown">
            <p><span>₹{priceperNight.toLocaleString("en-IN")} × {nights} nights</span><span>₹{total.toLocaleString("en-IN")}</span></p>
            <hr />
            <p className="booking-total"><strong>Total</strong><strong>₹{total.toLocaleString("en-IN")}</strong></p>
          </div>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        <button className="details-book-button" type="submit" disabled={loading}>
          {loading ? "Processing..." : "Reserve"}
        </button>
        <p className="booking-note">You won't be charged in this demo.</p>
      </form>
    </aside>
  );
}
