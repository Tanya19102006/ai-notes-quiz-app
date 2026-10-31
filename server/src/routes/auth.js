import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { appEvents } from "../utils/logger.js";

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/signup", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!EMAIL_RE.test(email) || password.length < 6) {
    return res.status(400).json({ message: "Enter a valid email and a password of at least 6 characters." });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Account already exists." });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });

  appEvents.emit("userSignedUp", { email: user.email });
  res.status(201).json({ token: makeToken(user._id.toString()), email: user.email });
});

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: makeToken(user._id.toString()), email: user.email });
});

export default router;
