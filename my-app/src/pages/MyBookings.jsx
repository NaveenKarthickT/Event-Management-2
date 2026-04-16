import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Link } from "react-router-dom";
import "./MyBookings.css";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) api.get(`/bookings/user/${user.id}`).then(setBookings);
  }, [user]);

  if (!user) return <p className="center-msg">Please <Link to="/login">login</Link> to view bookings.</p>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="center-msg">No bookings yet. <Link to="/">Browse Events</Link></p>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b.id} className="booking-item">
              <div className="booking-info">
                <h3>{b.event.title}</h3>
                <p>📅 {b.event.date} &nbsp; 📍 {b.event.location}</p>
                <p>Booked on: {new Date(b.booked_at).toLocaleDateString()}</p>
              </div>
              <div className="booking-ticket">
                <span className="ticket-label">Ticket ID</span>
                <span className="ticket-id">{b.ticket_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}