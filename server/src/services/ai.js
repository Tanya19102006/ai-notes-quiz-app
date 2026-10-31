// AI service: calls the Gemini API with plain fetch (async/await).
// The API key is read from the server .env and never reaches the browser.

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `You are an educational notes assistant.
Given the student's notes, return ONLY valid JSON (no markdown, no code fences) with this shape:
{
  "title": "short title",
  "summary": "clear student-friendly summary in 1-3 short paragraphs",
  "quiz": [
    { "question": "string", "options": ["A","B","C","D"], "answer": 0, "explanation": "short explanation" }
  ]
}
Rules:
- quiz has exactly 5 multiple-choice questions
- each question has exactly 4 options
- answer is the integer index (0-3) of the correct option
- questions must be based only on the supplied notes; do not invent facts`;

function aiError(message, status = 502) {
  return Object.assign(new Error(message), { status, expose: true });
}

// Models sometimes wrap JSON in ```json fences - strip them safely.
export function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw aiError("AI did not return JSON. Please try again.");
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw aiError("AI returned broken JSON. Please try again.");
  }
}

// Check the shape of the AI output before saving anything.
export function validateStudyMaterial(parsed) {
  if (!parsed || typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw aiError("AI response had no summary. Please try again.");
  }
  if (!Array.isArray(parsed.quiz) || parsed.quiz.length < 5) {
    throw aiError("AI response had fewer than 5 questions. Please try again.");
  }

  const quiz = parsed.quiz.slice(0, 5).map((q) => {
    const options = Array.isArray(q?.options) ? q.options.map(String) : [];
    const answer = Number(q?.answer);
    if (!q?.question || options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3) {
      throw aiError("AI returned a badly formatted question. Please try again.");
    }
    return {
      question: String(q.question),
      options,
      answer,
      explanation: String(q.explanation || "")
    };
  });

  return {
    title: String(parsed.title || "Untitled Notes").slice(0, 80),
    summary: parsed.summary.trim(),
    quiz
  };
}

// ---------- Demo mode (only used when GEMINI_API_KEY is empty) ----------
const demoBank = [
  { question: "What is the main idea of the notes?", right: "The central concept discussed", wrong: ["A random example", "A side topic", "An unrelated fact"] },
  { question: "Which statement best matches the supplied material?", right: "A key statement from the notes", wrong: ["A contradictory statement", "An unrelated statement", "None of these"] },
  { question: "What is a useful way to revise this topic?", right: "Review the main concepts", wrong: ["Ignore the definitions", "Study an unrelated topic", "Skip the notes"] },
  { question: "What should a student identify first?", right: "Important concepts", wrong: ["Unrelated details", "Only page numbers", "Nothing"] },
  { question: "What is the purpose of a summary?", right: "Condense the important information", wrong: ["Add unrelated information", "Remove all key ideas", "Make the notes longer"] }
];

function demoGenerate(notes) {
  const cleaned = notes.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const quiz = demoBank.map((item) => {
    const options = [item.right, ...item.wrong].sort(() => Math.random() - 0.5);
    return {
      question: item.question,
      options,
      answer: options.indexOf(item.right),
      explanation: "Demo question - add a GEMINI_API_KEY to get real AI-generated questions."
    };
  });
  return {
    title: cleaned.slice(0, 55) || "Untitled Notes",
    summary: sentences.slice(0, 5).join(" ") || cleaned.slice(0, 500),
    quiz
  };
}

export async function generateStudyMaterial(notes) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ...demoGenerate(notes), demo: true };

  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  let res;
  try {
    res = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: notes }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 }
      }),
      signal: AbortSignal.timeout(60000)
    });
  } catch {
    throw aiError("Could not reach the AI service. Check your internet and try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 429) throw aiError("AI rate limit reached. Wait a minute and try again.", 429);
    if (res.status === 400 || res.status === 403) {
      throw aiError("AI request was rejected. Check GEMINI_API_KEY and GEMINI_MODEL in server/.env.");
    }
    throw aiError(data?.error?.message || "AI service error. Please try again.");
  }

  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  return { ...validateStudyMaterial(extractJson(text)), demo: false };
}
