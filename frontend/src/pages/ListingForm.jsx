import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getApiError } from "../services/api";

const initial = { title: "", description: "", location: "", priceperNight: "", bedrooms: "1", maxGuests: "1", imagesText: "" };

export default function ListingForm() {
  const { id } = useParams();
  const editMode = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(editMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editMode) return;
    let active = true;
    api.get(`/listings/${id}`).then(({ data }) => {
      const listing = data.listing || data.data?.listing || data;
      if (!active) return;
      setForm({
        title: listing.title || "",
        description: listing.description || "",
        location: listing.location || "",
        priceperNight: String(listing.priceperNight ?? ""),
        bedrooms: String(listing.bedrooms ?? 1),
        maxGuests: String(listing.maxGuests ?? 1),
        imagesText: Array.isArray(listing.images) ? listing.images.join("\n") : ""
      });
    }).catch((err) => setError(getApiError(err, "Could not load listing.")))
      .finally(() => setFetching(false));
    return () => { active = false; };
  }, [id, editMode]);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      priceperNight: Number(form.priceperNight),
      bedrooms: Number(form.bedrooms),
      maxGuests: Number(form.maxGuests),
      images: form.imagesText.split("\n").map((url) => url.trim()).filter(Boolean)
    };
    try {
      if (editMode) await api.put(`/listings/${id}`, payload);
      else await api.post("/listings", payload);
      navigate("/host/dashboard", { replace: true });
    } catch (err) {
      setError(getApiError(err, "Could not save listing."));
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="status-message">Loading listing...</div>;

  return (
    <main className="page-container narrow-page">
      <p className="section-eyebrow">HOST TOOLS</p>
      <h1>{editMode ? "Edit property" : "Add a property"}</h1>
      {error && <p className="form-error">{error}</p>}
      <form className="listing-form" onSubmit={submit}>
        <label htmlFor="title">Property title</label><input id="title" name="title" value={form.title} onChange={change} required />
        <label htmlFor="location">Location</label><input id="location" name="location" value={form.location} onChange={change} required />
        <label htmlFor="description">Description</label><textarea id="description" name="description" rows="5" value={form.description} onChange={change} required />
        <div className="form-two-columns">
          <div><label htmlFor="priceperNight">Price per night (₹)</label><input id="priceperNight" name="priceperNight" type="number" min="1" value={form.priceperNight} onChange={change} required /></div>
          <div><label htmlFor="bedrooms">Bedrooms</label><input id="bedrooms" name="bedrooms" type="number" min="1" value={form.bedrooms} onChange={change} required /></div>
        </div>
        <label htmlFor="maxGuests">Maximum guests</label><input id="maxGuests" name="maxGuests" type="number" min="1" value={form.maxGuests} onChange={change} required />
        <label htmlFor="imagesText">Image URLs (one URL per line, optional)</label><textarea id="imagesText" name="imagesText" rows="4" value={form.imagesText} onChange={change} placeholder="https://example.com/property-photo.jpg" />
        <p className="muted small-text">Use direct image URLs. This form does not upload image files.</p>
        <button className="auth-submit" disabled={loading}>{loading ? "Saving..." : editMode ? "Save changes" : "Create listing"}</button>
      </form>
    </main>
  );
}
