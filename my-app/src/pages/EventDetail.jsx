import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent]     = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then(setEvent);
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    const res = await api.post("/bookings", { user_id: user.id, event_id: event.id });
    setLoading(false);
    if (res.booking) {
      setMessage(`✅ Booking confirmed! Ticket ID: ${res.booking.ticket_id}`);
      setEvent(prev => ({ ...prev, available_seats: prev.available_seats - 1 }));
    } else {
      setMessage(`❌ ${res.error}`);
    }
  };

  if (!event) return <p className="loading-text">Loading event...</p>;

  return (
    <div className="event-detail">
      <div className="detail-header">
        <span className="detail-category">{event.category}</span>
        <h1>{event.title}</h1>
        <p className="detail-location">📍 {event.location}</p>
      </div>

      <div className="detail-body">
        <div className="detail-info">
          <p className="detail-desc">{event.description}</p>
          <div className="detail-meta-grid">
            <div className="meta-box">
              <span className="meta-label">Date</span>
              <span className="meta-value">📅 {event.date}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Seats Available</span>
              <span className="meta-value">🪑 {event.available_seats} / {event.seats}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Price</span>
              <span className="meta-value">
                {event.price === 0 ? "🎟️ Free" : `💰 ₹${event.price}`}
              </span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Total Booked</span>
              <span className="meta-value">👥 {event.booked_count}</span>
            </div>
          </div>
        </div>

        <div className="booking-panel">
          <h3>Book Your Seat</h3>
          {message && <div className="booking-message">{message}</div>}
          <button
            className="btn-book"
            onClick={handleBook}
            disabled={event.available_seats <= 0 || loading}
          >
            {event.available_seats <= 0 ? "Sold Out" : loading ? "Booking..." : "Book Now"}
          </button>
          {!user && <p className="login-hint">Please login to book</p>}
        </div>
      </div>
    </div>
  );
}