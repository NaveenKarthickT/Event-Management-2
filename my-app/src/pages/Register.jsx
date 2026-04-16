import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const res = await api.post("/register", form);
    if (res.user) navigate("/login");
    else setError(res.error || "Registration failed");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-sub">Join EventHub today</p>
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input placeholder="John Doe"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>

        <button className="btn-auth" onClick={handleSubmit}>Register</button>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}