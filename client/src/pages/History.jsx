import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function History() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.history()
      .then((data) => setItems(data.notes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id) {
    if (!confirm("Delete this saved note?")) return;
    setError("");
    try {
      await api.deleteNote(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function open(id) {
    setError("");
    try {
      const data = await api.getNote(id);
      setSelected(data.note);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <section className="hero compact">
        <div>
          <div className="eyebrow">SAVED STUDY MATERIAL</div>
          <h1>History</h1>
          <p>Open or delete any previously generated notes.</p>
        </div>
        <Link to="/home" className="primary">New Notes</Link>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="history-grid">
        <div className="card">
          <h2>Past notes</h2>
          {loading && <p className="muted">Loading...</p>}
          {!loading && items.length === 0 && <p className="muted">No saved notes yet.</p>}
          {items.map((item) => (
            <div className="history-item" key={item._id}>
              <div>
                <strong>{item.title}</strong>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <div className="history-actions">
                <button onClick={() => open(item._id)}>Open</button>
                <button className="danger" onClick={() => remove(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card">
            <div className="eyebrow">NOTE</div>
            <h2>{selected.title}</h2>
            <p className="summary">{selected.summary}</p>
            <h3>Quiz</h3>
            {selected.quiz.map((q, i) => (
              <div className="saved-question" key={i}>
                <strong>{i + 1}. {q.question}</strong>
                <p>Correct answer: {q.options[q.answer]}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
