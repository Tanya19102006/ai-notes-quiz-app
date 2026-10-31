// Module 4 (Node.js): fs, path and EventEmitter
import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LOG_DIR = path.join(__dirname, "..", "..", "logs");
export const LOG_FILE = path.join(LOG_DIR, "requests.log");

fs.mkdirSync(LOG_DIR, { recursive: true });

export function writeLog(line) {
  const entry = `${new Date().toISOString()} ${line}\n`;
  fs.appendFile(LOG_FILE, entry, (err) => {
    if (err) console.error("Log write failed:", err.message);
  });
}

// Custom events: routes emit them, the listeners below react to them.
export const appEvents = new EventEmitter();

appEvents.on("userSignedUp", ({ email }) => writeLog(`EVENT userSignedUp email=${email}`));
appEvents.on("noteSaved", ({ userId, noteId }) => writeLog(`EVENT noteSaved user=${userId} note=${noteId}`));
appEvents.on("noteDeleted", ({ userId, noteId }) => writeLog(`EVENT noteDeleted user=${userId} note=${noteId}`));
