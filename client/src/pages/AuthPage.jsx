import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signup = mode === "signup";

  async function submit(e) {
    e.preventDefault();
    setError("");

    // form validation (Module 2)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      const data = signup ? await api.signup(email, password) : await api.login(email, password);
      login(data.token, data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="eyebrow">AI STUDY ASSISTANT</div>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">Summarize notes and generate a 5-question quiz in seconds.</p>

        <form onSubmit={submit} noValidate>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={busy}>
            {busy ? "Please wait..." : signup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="switch">
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Sign up"}</Link>
        </p>
      </section>
    </main>
  );
}
