// scripts/dev.js
// Mini dev server: same /api/chat handler, real LLM call, serves index.html.
// No Vercel login needed. Run with:  node scripts/dev.js

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
process.chdir(ROOT);

// ── Load .env (no dotenv dep) ─────────────────────────────────────────────
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
  console.log("[dev] loaded .env");
} else {
  console.log("[dev] no .env found at project root");
}

if (!process.env.LLM_API_KEY && !process.env.OPENCODE_API_KEY) {
  console.error(
    "[dev] missing LLM_API_KEY (or OPENCODE_API_KEY). " +
    "Put it in .env. See .env.example."
  );
}

const chatHandler = require(path.join(ROOT, "api/chat.js"));

// ── Static + API routing ──────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".md": "text/markdown; charset=utf-8",
};

const server = http.createServer((req, res) => {
  // API routes go to the real handler.
  if (req.url.startsWith("/api/chat")) {
    return chatHandler(req, res);
  }

  // Static: serve files from project root.
  const urlPath = req.url.split("?")[0];
  const cleanPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(ROOT, decodeURIComponent(cleanPath));

  // Prevent path traversal.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  const provider =
    (process.env.LLM_BASE_URL || process.env.OPENCODE_BASE_URL || "https://api.groq.com/openai/v1");
  const model =
    (process.env.LLM_MODEL || process.env.OPENCODE_MODEL || "llama-3.3-70b-versatile");
  console.log(`[dev] http://localhost:${PORT}`);
  console.log(`[dev] LLM   ${provider}`);
  console.log(`[dev] model ${model}`);
  console.log(`[dev] ctrl+c to stop`);
});
