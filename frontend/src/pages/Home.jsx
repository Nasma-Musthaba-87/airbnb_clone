import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import ListingCard from "../components/ListingCard";
import api, { getApiError } from "../services/api";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit: 8, sort };

        if (filters.location) params.location = filters.location;
        if (filters.guests) params.guests = filters.guests;

        // Only send the dates when both are picked
        if (filters.checkIn && filters.checkOut) {
          params.checkIn = filters.checkIn;
          params.checkOut = filters.checkOut;
        }

        const response = await api.get("/listings", {params});
        const data = response.data;

        if (active) {
          setListings(data.listings || []);
          setTotalPages(data.totalPages || 1);
          setTotalListings(data.totalListings || 0);
        }
      } catch (err) {
        if (active) {
          setError(getApiError(err, "Could not load properties. Make sure the backend is running."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { active = false; };
  }, [filters, sort, page]);

  function handleSearch(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleSort(event) {
    setSort(event.target.value);
    setPage(1);
  }

  function clearSearch() {
    setFilters({});
    setPage(1);
  }

  function changePage(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <section className="hero-section">
        <p className="hero-eyebrow">YOUR NEXT GETAWAY STARTS HERE</p>
        <h1>Find a place to <span>belong.</span></h1>
        <p className="hero-description">Discover stays for weekends, holidays, and everything in between.</p>
        <SearchBar onSearch={handleSearch} />
      </section>

      <main className="listings-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">CURATED FOR YOU</p>
            <h2>Explore stays</h2>
          </div>
          <div className="listing-tools">
            {!loading && (
              <span className="listing-count">
                {totalListings} {totalListings === 1 ? "property" : "properties"}
              </span>
            )}
            <select className="sort-select" value={sort} onChange={handleSort} aria-label="Sort listings">
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="status-message"><div className="loader" />Finding lovely stays...</div>
        ) : error ? (
          <div className="status-message error-message">
            {error}
            <p><button className="secondary-button" onClick={() => setFilters({ ...filters })}>Try again</button></p>
          </div>
        ) : listings.length ? (
          <div className="properties-grid">
            {listings.map((listing) => (
              <ListingCard key={listing._id || listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>⌂</span>
            <h3>No stays found</h3>
            <p>Try another destination or clear your search.</p>
            <button onClick={clearSearch}>Clear search</button>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button className="secondary-button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="secondary-button" disabled={page === totalPages} onClick={() => changePage(page + 1)}>Next</button>
          </div>
        )}
      </main>
    </>
  );
}