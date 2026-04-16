import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const EMPTY = { title: "", description: "", date: "", location: "", seats: 100, price: 0, category: "General" };

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents]   = useState([]);
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg]         = useState("");

  const load = () => api.get("/events").then(data =>
    setEvents(data.filter(e => e.organizer_id === user?.id))
  );

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = { ...form, organizer_id: user.id };
    if (editing) await api.put(`/events/${editing}`, payload);
    else await api.post("/events", payload);
    setMsg(editing ? "Event updated!" : "Event created!");
    setForm(EMPTY); setEditing(null); load();
  };

  const handleEdit = (ev) => {
    setForm({ title: ev.title, description: ev.description, date: ev.date,
              location: ev.location, seats: ev.seats, price: ev.price, category: ev.category });
    setEditing(ev.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this event?")) {
      await api.delete(`/events/${id}`);
      load();
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="dashboard">
      <h2>Organizer Dashboard</h2>
      {msg && <div className="dash-msg">{msg}</div>}

      <div className="dash-grid">
        <div className="dash-form">
          <h3>{editing ? "Edit Event" : "Create New Event"}</h3>
          <input placeholder="Title" value={form.title} onChange={f("title")} />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={f("description")} />
          <input type="date" value={form.date} onChange={f("date")} />
          <input placeholder="Location" value={form.location} onChange={f("location")} />
          <input type="number" placeholder="Seats" value={form.seats} onChange={f("seats")} />
          <input type="number" placeholder="Price (₹)" value={form.price} onChange={f("price")} />
          <select value={form.category} onChange={f("category")}>
            {["Music","Tech","Art","Food","General"].map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="dash-btns">
            <button className="btn-save" onClick={handleSave}>
              {editing ? "Update" : "Create"} Event
            </button>
            {editing && <button className="btn-cancel" onClick={() => { setForm(EMPTY); setEditing(null); }}>Cancel</button>}
          </div>
        </div>

        <div className="dash-events">
          <h3>Your Events ({events.length})</h3>
          {events.map(ev => (
            <div key={ev.id} className="dash-event-item">
              <div>
                <strong>{ev.title}</strong>
                <p>{ev.date} · {ev.location} · {ev.booked_count}/{ev.seats} booked</p>
              </div>
              <div className="dash-event-actions">
                <button onClick={() => handleEdit(ev)}>Edit</button>
                <button className="btn-del" onClick={() => handleDelete(ev.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}