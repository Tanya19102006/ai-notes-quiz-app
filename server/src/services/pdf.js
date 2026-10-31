// Reads text out of an uploaded PDF (the file arrives as a Buffer in memory)
import { extractText, getDocumentProxy } from "unpdf";

export const MAX_CHARS = 30000;

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export async function extractPdfText(buffer) {
  // Every real PDF starts with the bytes "%PDF-"
  if (!buffer || buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw httpError(400, "This file is not a valid PDF.");
  }

  let pdf;
  try {
    // copy into a plain Uint8Array (the PDF reader does not accept a Node Buffer)
    pdf = await getDocumentProxy(new Uint8Array(buffer));
  } catch {
    throw httpError(400, "Could not read this PDF. It may be damaged or password protected.");
  }

  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  const cleaned = String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < 30) {
    throw httpError(422, "No readable text found. Scanned or image-only PDFs are not supported - try a PDF with selectable text.");
  }

  const truncated = cleaned.length > MAX_CHARS;
  return {
    text: truncated ? cleaned.slice(0, MAX_CHARS) : cleaned,
    pages: totalPages,
    truncated,
    totalChars: cleaned.length
  };
}
