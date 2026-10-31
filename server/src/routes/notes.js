import express from "express";
import multer from "multer";
import Note from "../models/Note.js";
import { auth } from "../middleware/auth.js";
import { generateStudyMaterial } from "../services/ai.js";
import { extractPdfText } from "../services/pdf.js";
import { appEvents } from "../utils/logger.js";

const router = express.Router();

// File upload: kept in memory (a Buffer), max 5 MB, one file only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

// POST /api/notes/extract  -> upload a PDF, get its text back (not saved yet)
// auth runs first, so logged-out users cannot upload anything
router.post("/extract", auth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose a PDF file to upload." });
  const result = await extractPdfText(req.file.buffer);
  res.json({ ...result, filename: req.file.originalname });
});

// POST /api/notes/generate  -> AI summary + 5 MCQs, saved in MongoDB
router.post("/generate", auth, async (req, res) => {
  const notes = String(req.body?.notes || "").trim();

  if (notes.length < 30) {
    return res.status(400).json({ message: "Please enter at least 30 characters of notes." });
  }
  if (notes.length > 30000) {
    return res.status(400).json({ message: "Notes are too long. Keep them under 30,000 characters." });
  }

  const result = await generateStudyMaterial(notes);

  const saved = await Note.create({
    user: req.userId,
    title: result.title,
    originalText: notes,
    summary: result.summary,
    quiz: result.quiz
  });

  appEvents.emit("noteSaved", { userId: req.userId, noteId: saved._id.toString() });
  res.status(201).json({ note: saved, demo: result.demo });
});

// GET /api/notes/history  (must stay above "/:id")
router.get("/history", auth, async (req, res) => {
  const notes = await Note.find({ user: req.userId })
    .select("title summary createdAt")
    .sort({ createdAt: -1 });
  res.json({ notes });
});

router.get("/:id", auth, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) return res.status(404).json({ message: "Note not found." });
  res.json({ note });
});

router.delete("/:id", auth, async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ message: "Note not found." });
  appEvents.emit("noteDeleted", { userId: req.userId, noteId: req.params.id });
  res.json({ message: "Note deleted." });
});

export default router;
