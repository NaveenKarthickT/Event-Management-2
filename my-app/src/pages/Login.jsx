import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const res = await api.post("/login", form);
    if (res.user) { login(res.user); navigate("/"); }
    else setError(res.error || "Login failed");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-sub">Login to book events</p>
        {error && <div className="auth-error">{error}</div>}

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

        <button className="btn-auth" onClick={handleSubmit}>Login</button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-hint">
          Demo: user@example.com / user123 &nbsp;|&nbsp; admin@example.com / admin123
        </p>
      </div>
    </div>
  );
}