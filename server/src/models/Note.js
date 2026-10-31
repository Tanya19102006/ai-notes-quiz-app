import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    answer: Number,
    explanation: String
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Notes" },
    originalText: { type: String, required: true },
    summary: { type: String, required: true },
    quiz: { type: [questionSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
