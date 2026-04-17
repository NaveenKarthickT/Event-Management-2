import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent]       = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets]   = useState([]);   // generated tickets
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    name: "", age: "", gender: "Male", seats: 1
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`).then(setEvent);
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!form.name || !form.age) { setError("Please fill all fields."); return; }
    if (form.seats < 1 || form.seats > event.available_seats) {
      setError(`Only ${event.available_seats} seats available.`); return;
    }
    setLoading(true); setError("");
    const res = await api.post("/bookings", {
      user_id: user.id, event_id: event.id,
      name: form.name, age: form.age,
      gender: form.gender, seats: Number(form.seats)
    });
    setLoading(false);
    if (res.tickets) {
      setTickets(res.tickets);
      setEvent(prev => ({
        ...prev,
        available_seats: prev.available_seats - Number(form.seats),
        booked_count: prev.booked_count + Number(form.seats)
      }));
      setShowModal(false);
    } else {
      setError(res.error || "Booking failed.");
    }
  };

  const printTickets = () => window.print();

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
          <button
            className="btn-book"
            onClick={() => { if (!user) navigate("/login"); else setShowModal(true); }}
            disabled={event.available_seats <= 0}
          >
            {event.available_seats <= 0 ? "Sold Out" : "Book Now"}
          </button>
          {!user && <p className="login-hint">Please login to book</p>}
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>Booking Details</h3>
            <p className="modal-event-name">{event.title}</p>
            {error && <div className="modal-error">{error}</div>}

            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Your full name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="modal-row">
              <div className="form-group">
                <label>Age</label>
                <input type="number" min="1" max="120" placeholder="25"
                  value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Number of Seats (max {Math.min(event.available_seats, 10)})</label>
              <input type="number" min="1" max={Math.min(event.available_seats, 10)}
                value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} />
            </div>

            <div className="modal-total">
              Total: <strong>{event.price === 0 ? "Free" : `₹${event.price * form.seats}`}</strong>
              &nbsp;({form.seats} seat{form.seats > 1 ? "s" : ""})
            </div>

            <button className="btn-book" onClick={handleBook} disabled={loading}>
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}

      {/* ── TICKETS ── */}
      {tickets.length > 0 && (
        <div className="tickets-section">
          <div className="tickets-header">
            <h3>🎉 Booking Confirmed! Your Tickets</h3>
            <button className="btn-print" onClick={printTickets}>🖨️ Print Tickets</button>
          </div>
          <div className="tickets-grid">
            {tickets.map((t, i) => (
              <div key={i} className="ticket-card">
                <div className="ticket-left">
                  <div className="ticket-logo">◆ EventHub</div>
                  <div className="ticket-event">{event.title}</div>
                  <div className="ticket-meta">
                    <span>📅 {event.date}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  <div className="ticket-holder">
                    <span>👤 {t.name}</span>
                    <span>🎂 Age: {t.age}</span>
                    <span>⚥ {t.gender}</span>
                  </div>
                </div>
                <div className="ticket-right">
                  <div className="ticket-id-label">TICKET</div>
                  <div className="ticket-id">{t.ticket_id}</div>
                  <div className="ticket-seat">Seat #{i + 1}</div>
                  <div className="ticket-price">
                    {event.price === 0 ? "FREE" : `₹${event.price}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}