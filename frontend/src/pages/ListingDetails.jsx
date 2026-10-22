import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import api, { getApiError } from "../services/api";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function loadReviews(listingId) {
    try {
      const response = await api.get(`/reviews/${listingId}`);
      const data = response.data;
      setReviews(data.reviews || data.data?.reviews || []);
      setAverageRating(data.averageRating ?? data.data?.averageRating ?? null);
    } catch {
      setReviews([]);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/listings/${id}`);
        const data = response.data;
        const found = data.listing || data.data?.listing || data;
        if (active) setListing(found);
        await loadReviews(id);
      } catch (err) {
        if (active) setError(getApiError(err, "Could not load this property."));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  async function submitReview(event) {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    try {
      setSubmittingReview(true);
      const response = await api.post("/reviews", {
        listingId: id,
        rating: Number(reviewRating),
        comment: comment.trim()
      });
      setReviewMessage(response.data?.message || "Review submitted.");
      setComment("");
      await loadReviews(id);
    } catch (err) {
      setReviewError(getApiError(err, "Could not submit review."));
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="status-message"><div className="loader" />Loading property...</div>;
  if (error || !listing) return <div className="status-message error-message">{error || "Property not found."}<p><Link to="/">Return home</Link></p></div>;

  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean).slice(0, 5) : [];

  return (
    <main className="listing-details-page">
      <Link to="/" className="back-link">← Back to stays</Link>
      <h1 className="details-title">{listing.title || "Untitled property"}</h1>
      <p className="details-location">📍 {listing.location || "Location not provided"} {averageRating != null && <> · ★ {Number(averageRating).toFixed(1)}</>}</p>

      <div className="details-gallery">
        {images.length ? images.map((image, index) =>
          <img key={`${image}-${index}`} src={image} alt={`${listing.title || "Property"} ${index + 1}`} className="details-image" />
        ) : <div className="details-image-placeholder"><span>⌂</span><p>No property photos available</p></div>}
      </div>

      <div className="details-content">
        <section className="details-main">
          <h2>Stay at {listing.title || "this property"}</h2>
          <p className="details-summary">{listing.maxGuests ?? "—"} guests · {listing.bedrooms ?? "—"} bedrooms</p>
          <hr />
          <h3>About this property</h3>
          <p className="details-description">{listing.description || "No description available."}</p>
          <hr />
          <h3>Property information</h3>
          <ul className="details-list">
            <li><strong>Location:</strong> {listing.location || "Not specified"}</li>
            <li><strong>Bedrooms:</strong> {listing.bedrooms ?? "Not specified"}</li>
            <li><strong>Maximum guests:</strong> {listing.maxGuests ?? "Not specified"}</li>
          </ul>
        </section>
        <BookingForm listing={listing} />
      </div>

      <section className="reviews-section">
        <h2>Guest reviews {averageRating != null && <span>★ {Number(averageRating).toFixed(1)}</span>}</h2>
        {reviews.length ? <div className="reviews-grid">{reviews.map((review) =>
          <article className="review-card" key={review._id}>
            <strong>{review.guest?.name || review.user?.name || "Guest"}</strong>
            <p className="review-stars">{"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}</p>
            <p>{review.comment}</p>
          </article>
        )}</div> : <p className="muted">No reviews yet. Be the first to share your experience after your stay.</p>}

        <form className="review-form" onSubmit={submitReview}>
          <h3>Write a review</h3>
          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewMessage && <p className="form-success">{reviewMessage}</p>}
          <label htmlFor="review-rating">Rating</label>
          <select id="review-rating" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option value={n} key={n}>{n} star{n === 1 ? "" : "s"}</option>)}
          </select>
          <label htmlFor="review-comment">Comment</label>
          <textarea id="review-comment" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} required maxLength={1000} />
          <button className="secondary-button" disabled={submittingReview}>{submittingReview ? "Submitting..." : "Submit review"}</button>
        </form>
      </section>
    </main>
  );
}
