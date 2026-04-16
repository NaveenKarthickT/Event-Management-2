import { useEffect, useState } from "react";
import { api } from "../api";
import EventCard from "../components/EventCard";
import "./Home.css";

const CATEGORIES = ["All", "Music", "Tech", "Art", "Food", "General"];

export default function Home() {
  const [events, setEvents]       = useState([]);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/events").then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const filtered = events.filter(e => {
    const matchCat    = filter === "All" || e.category === filter;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                        e.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Find & Book Amazing Events</h1>
        <p>Concerts, conferences, exhibitions and more — all in one place</p>
        <input
          className="hero-search"
          placeholder="Search events or locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="home-body">
        <div className="category-filters">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`filter-btn ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading-text">Loading events...</p>
        ) : filtered.length === 0 ? (
          <p className="no-events">No events found.</p>
        ) : (
          <div className="events-grid">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}