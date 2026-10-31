// Module 4 (Node.js): a basic HTTP server WITHOUT Express.
// Run:  node basic-server.js   then open http://localhost:4000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "logs", "requests.log");
const PORT = 4000;

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    return send(res, 200, "Basic Node.js HTTP server (no Express). Try /health, /logs, POST /echo", "text/plain");
  }

  if (method === "GET" && url === "/health") {
    return send(res, 200, { ok: true, time: new Date().toISOString() });
  }

  // Reads the log file written by the Express app (fs.readFile + path)
  if (method === "GET" && url === "/logs") {
    return fs.readFile(LOG_FILE, "utf8", (err, data) => {
      if (err) return send(res, 404, { message: "No log file yet. Start the main server first." });
      send(res, 200, data.trim().split("\n").slice(-20), "application/json");
    });
  }

  // Reads the request body using stream events
  if (method === "POST" && url === "/echo") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        send(res, 200, { youSent: JSON.parse(body || "{}") });
      } catch {
        send(res, 400, { message: "Body must be valid JSON." });
      }
    });
    return;
  }

  send(res, 404, { message: "Not found" });
});

server.listen(PORT, () => console.log(`Basic server running on http://localhost:${PORT}`));
