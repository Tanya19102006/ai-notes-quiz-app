import { writeLog } from "../utils/logger.js";

// Logs every request (method, url, status, time) to logs/requests.log
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    writeLog(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
