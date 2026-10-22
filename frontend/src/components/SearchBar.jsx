import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  function submit(event) {
    event.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      alert("Check-out must be after check-in.");
      return;
    }
    onSearch({
      location: location.trim(),
      guests: guests ? Number(guests) : "",
      checkIn,
      checkOut
    });
  }

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <section className="search-section">
      <form className="search-bar" onSubmit={submit}>
        <div className="search-field">
          <label htmlFor="search-location">Where</label>
          <input id="search-location" placeholder="Search destinations" value={location}
            onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="search-field">
          <label htmlFor="search-checkin">Check in</label>
          <input id="search-checkin" type="date" min={today} value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="search-field">
          <label htmlFor="search-checkout">Check out</label>
          <input id="search-checkout" type="date" min={checkIn || today} value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)} />
        </div>
        <div className="search-field">
          <label htmlFor="search-guests">Guests</label>
          <select id="search-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
          </select>
        </div>
        <button className="search-button" type="submit" aria-label="Search">⌕</button>
      </form>
    </section>
  );
}
