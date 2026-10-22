import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import api, { getApiError } from "../services/api";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.location) params.location = filters.location;
        if (filters.guests) params.guests = filters.guests;
        const response = await api.get("/listings", { params });
        const data = response.data;
        const items = Array.isArray(data) ? data : (data.listings || data.data?.listings || []);
        if (active) setListings(items);
      } catch (err) {
        if (active) setError(getApiError(err, "Could not load properties. Make sure the backend is running."));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [filters]);

  return (
    <>
      <section className="hero-section">
        <p className="hero-eyebrow">YOUR NEXT GETAWAY STARTS HERE</p>
        <h1>Find a place to <span>belong.</span></h1>
        <p className="hero-description">Discover stays for weekends, holidays, and everything in between.</p>
        <SearchBar onSearch={setFilters} />
      </section>

      <main className="listings-section">
        <div className="section-heading">
          <div><p className="section-eyebrow">CURATED FOR YOU</p><h2>Explore stays</h2></div>
          {!loading && <span className="listing-count">{listings.length} {listings.length === 1 ? "property" : "properties"}</span>}
        </div>

        {loading ? <div className="status-message"><div className="loader" />Finding lovely stays...</div> :
          error ? <div className="status-message error-message">{error}<p><button className="secondary-button" onClick={() => setFilters({ ...filters })}>Try again</button></p></div> :
          listings.length ? <div className="properties-grid">{listings.map((listing) =>
            <ListingCard key={listing._id || listing.id} listing={listing} />
          )}</div> :
          <div className="empty-state"><span>⌂</span><h3>No stays found</h3><p>Try another destination or clear your search.</p><button onClick={() => setFilters({})}>Clear search</button></div>
        }
      </main>
    </>
  );
}
