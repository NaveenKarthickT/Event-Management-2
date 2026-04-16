import { Link } from "react-router-dom";
import "./EventCard.css";

const categoryColors = {
  Music: "#e94560", Tech: "#0f3460", Art: "#533483",
  Food: "#e8a838", General: "#2c7873",
};

export default function EventCard({ event }) {
  const color = categoryColors[event.category] || "#555";
  const isFull = event.available_seats <= 0;

  return (
    <div className="event-card">
      <div className="event-card-banner" style={{ background: color }}>
        <span className="event-category">{event.category}</span>
        {isFull && <span className="sold-out">SOLD OUT</span>}
      </div>
      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description?.substring(0, 80)}...</p>
        <div className="event-meta">
          <span>📅 {event.date}</span>
          <span>📍 {event.location}</span>
          <span>🪑 {event.available_seats} seats left</span>
          <span>💰 {event.price === 0 ? "Free" : `₹${event.price}`}</span>
        </div>
      </div>
      <div className="event-card-footer">
        <Link to={`/events/${event.id}`} className="btn-view">
          View Details →
        </Link>
      </div>
    </div>
  );
}