import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Quiz from "../components/Quiz.jsx";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_CHARS = 30000;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [material, setMaterial] = useState(null);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [reading, setReading] = useState(false);
  const fileInput = useRef(null);

  // Upload a PDF (text is extracted on the server) or a TXT file (read in the browser)
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    setError("");
    setInfo("");

    const name = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    const isTxt = file.type === "text/plain" || name.endsWith(".txt");

    if (!isPdf && !isTxt) return setError("Please choose a PDF or TXT file.");
    if (file.size > MAX_FILE_BYTES) return setError("File is too large. Maximum size is 5 MB.");

    setReading(true);
    try {
      if (isPdf) {
        const data = await api.extractPdf(file);
        setNotes(data.text);
        setInfo(
          `Loaded ${data.pages} page${data.pages === 1 ? "" : "s"} from ${data.filename}.` +
            (data.truncated ? ` The PDF is long, so only the first ${MAX_CHARS.toLocaleString()} characters were used.` : "") +
            " Review the text below, then click Generate."
        );
      } else {
        const text = (await file.text()).trim();
        if (text.length < 30) throw new Error("This file has too little text.");
        setNotes(text.slice(0, MAX_CHARS));
        setInfo(`Loaded ${file.name}. Review the text below, then click Generate.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
    }
  }

  async function generate() {
    if (notes.trim().length < 30) return setError("Paste at least 30 characters of notes first.");
    setError("");
    setBusy(true);
    setMaterial(null);
    try {
      const data = await api.generate(notes);
      setMaterial(data.note);
      setDemo(Boolean(data.demo));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <div>
          <div className="eyebrow">SMART STUDY WORKSPACE</div>
          <h1>Turn notes into a study plan.</h1>
          <p>Paste your notes. Study the summary. Test yourself with five AI-generated MCQs.</p>
        </div>
        <Link to="/history" className="secondary">View History</Link>
      </section>

      <section className="card">
        <div className="section-title">
          <div>
            <h2>Your notes</h2>
            <p className="muted">Paste lecture notes, textbook content, or revision material.</p>
          </div>
          <span className="counter">{notes.length}/30000</span>
        </div>
        <div className="upload-row">
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={onFile}
            hidden
          />
          <button
            type="button"
            className="secondary"
            onClick={() => fileInput.current.click()}
            disabled={reading || busy}
          >
            {reading ? "Reading file..." : "Upload PDF / TXT"}
          </button>
          <span className="muted">or paste your notes below</span>
        </div>
        {info && <div className="info">{info}</div>}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here..."
          maxLength={30000}
        />
        {error && <div className="error">{error}</div>}
        <button className="primary" onClick={generate} disabled={busy}>
          {busy ? "AI is generating..." : "Generate Summary + Quiz"}
        </button>
      </section>

      {material && (
        <>
          {demo && (
            <div className="notice">
              Demo mode: no GEMINI_API_KEY is set on the server, so this quiz is a generic placeholder, not real AI output.
            </div>
          )}

          <section className="card">
            <div className="eyebrow">SUMMARY</div>
            <h2>{material.title}</h2>
            <p className="summary">{material.summary}</p>
          </section>

          {/* key makes the quiz reset itself whenever a new note is generated */}
          <Quiz key={material._id} quiz={material.quiz} />
        </>
      )}
    </main>
  );
}
