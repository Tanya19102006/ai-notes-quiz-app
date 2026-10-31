import { writeLog } from "../utils/logger.js";

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error-handling middleware (4 arguments).
// Express 5 forwards errors from async route handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong.";

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else if (err.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.code === "LIMIT_FILE_SIZE"
      ? "File is too large. Maximum size is 5 MB."
      : "Upload exactly one file.";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id.";
  } else if (err.name === "ValidationError") {
    status = 400;
  } else if (err.code === 11000) {
    status = 409;
    message = "Already exists.";
  }

  if (status >= 500) {
    console.error(err);
    writeLog(`ERROR ${req.method} ${req.originalUrl} ${err.message}`);
    if (!err.expose) message = "Server error. Please try again.";
  }

  res.status(status).json({ message });
}
