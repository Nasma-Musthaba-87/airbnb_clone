import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const image = Array.isArray(listing.images) ? listing.images.find(Boolean) : null;
  const id = listing._id || listing.id;

  return (
    <article className="property-card">
      <Link to={`/listings/${id}`} className="property-image-link" aria-label={`View ${listing.title || "property"}`}>
        {image ? (
          <img src={image} alt={listing.title || "Property"} className="property-image"
            loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="property-placeholder"><span className="placeholder-icon">⌂</span>
          <p>StayFinder stay</p></div>
        )}
        <span className="guest-favorite">Guest favorite</span>
      </Link>
      <div className="property-info">
        <div className="property-heading">
          <h3>{listing.location || "Location not listed"}</h3>
          <span className="rating">★ New</span>
        </div>
        <p className="property-title">{listing.title || "Untitled property"}</p>
        <p className="property-description">{listing.bedrooms ?? "—"} bedrooms · up to {listing.maxGuests ?? "—"} guests</p>
        <p className="property-price">₹{Number(listing.priceperNight || 0).toLocaleString("en-IN")} <span>/ night</span></p>
      </div>
    </article>
  );
}
