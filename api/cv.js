// /api/cv.js
// Serves Ramiro's AI Engineer CV as a downloadable PDF.

const fs = require("node:fs");
const path = require("node:path");

const CV_FILENAME = "Ramiro_Carnicer_Souble_CV_AI_engineer.pdf";
const CV_PATH = path.join(process.cwd(), "cv", CV_FILENAME);

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }

  let stat;
  try {
    stat = fs.statSync(CV_PATH);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "cv not found" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", String(stat.size));
  res.setHeader("Content-Disposition", `attachment; filename="${CV_FILENAME}"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(CV_PATH).pipe(res);
};
