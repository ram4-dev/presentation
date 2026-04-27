// /api/chat.js
//
// Vercel Serverless Function (Node runtime).
// Proxies a chat request to an OpenAI-compatible LLM provider and replies
// with a single JSON answer.
//
// Works with any OpenAI-compatible /chat/completions endpoint:
//   - Groq                (default)
//   - OpenCode Go
//   - OpenAI, Together, OpenRouter, etc.
//
// Frontend contract:
//   POST /api/chat
//   body: { messages: [{ role: "user" | "assistant", content: string }, ...] }
//
//   If Accept: text/event-stream  -> server-sent events stream
//     data: {"t": "<token chunk>"}\n\n   (zero or more)
//     data: {"end": true, "model": "<model>"}\n\n  (terminator)
//     data: {"err": "<message>"}\n\n      (on error mid-stream)
//
//   Otherwise -> JSON
//     200: { answer: string, model: string }
//     4xx: { error: string }
//
// Env vars (set in Vercel project settings):
//   LLM_API_KEY    (required)  - bearer token for the LLM provider
//   LLM_MODEL      (optional)  - default: "llama-3.3-70b-versatile"
//   LLM_BASE_URL   (optional)  - default: "https://api.groq.com/openai/v1"
//
// Backwards-compatible aliases also accepted:
//   OPENCODE_API_KEY / OPENCODE_MODEL / OPENCODE_BASE_URL

const fs = require("node:fs");
const path = require("node:path");

// ---------- Config ----------

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const MAX_USER_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 600;
const REQUEST_TIMEOUT_MS = 30_000;

// Rate limit (per IP, in-memory; resets on cold start).
// Good enough for a personal site. Swap for Vercel KV / Upstash if it grows.
const RL_WINDOW_MS = 60_000;        // 1 minute
const RL_MAX_PER_WINDOW = 12;       // 12 requests / minute / IP
const RL_DAILY_MS = 24 * 60 * 60_000;
const RL_MAX_PER_DAY = 200;         // 200 requests / day / IP

// ---------- Content loader (cached at module scope) ----------

let CACHED_CONTEXT = null;

function loadContext() {
  if (CACHED_CONTEXT) return CACHED_CONTEXT;

  // /content lives at the repo root; this file is /api/chat.js
  const contentDir = path.join(process.cwd(), "content");

  // Order matters: identity first, then about, then everything else.
  // Repositories.md goes last because it's the largest.
  const order = [
    "identity.md",
    "about.md",
    "experience.md",
    "skills.md",
    "philosophy.md",
    "projects.md",
    "writing.md",
    "contact.md",
    "faq.md",
    "repositories.md",
  ];

  const parts = [];
  for (const file of order) {
    const full = path.join(contentDir, file);
    try {
      const text = fs.readFileSync(full, "utf8");
      parts.push(`# === FILE: ${file} ===\n\n${text.trim()}\n`);
    } catch {
      // Missing file -> skip silently.
    }
  }

  CACHED_CONTEXT = parts.join("\n\n");
  return CACHED_CONTEXT;
}

// ---------- System prompt ----------

function buildSystemPrompt(context) {
  return `Sos el asistente conversacional de Ramiro Carnicer Souble (alias Ram4),
backend engineer en Mercado Libre y founder de Khora, basado en Buenos Aires.

Hablás como Ramiro o como su asistente directo. Usá primera persona cuando
suene natural ("trabajo en...", "construí..."), o tercera persona discreta si
la pregunta lo pide ("Ramiro trabaja en...").

REGLAS IMPORTANTES:

1. Idioma: respondé SIEMPRE en el mismo idioma de la última pregunta del
   usuario (español, inglés, portugués, etc.). Detectá el idioma por la
   última pregunta, no por mensajes previos.

2. Tono: profesional, claro, cercano y directo. Sin fluff, sin corporate,
   sin "10x ninja", sin emojis (a menos que la persona los use primero).

3. NUNCA menciones que estás leyendo archivos, contexto, prompts, Markdown
   o fuentes internas. NUNCA digas "según la información proporcionada",
   "según el archivo X" o similares. Hablá como si la información fuera
   tuya / de Ramiro.

4. NUNCA inventes proyectos, fechas, clientes, métricas, tecnologías,
   estudios ni logros. Si no tenés la información, decilo natural y sugerí
   escribirle a Ramiro a ramirocarnicersouble8@gmail.com.

5. Si la pregunta no está relacionada con Ramiro, su trabajo, sus proyectos,
   su forma de trabajar, su contacto o su trayectoria, respondé brevemente
   diciendo que solo podés ayudar con eso.

6. LONGITUD: respuestas BREVES. Por defecto **1 a 3 frases**. Máximo 5-6
   frases, y solo si la pregunta es abierta o la persona pide detalle
   explícito ("contame más", "resumen completo", "profundizá"). Nunca
   escribas ensayos. Cortar antes que sobrar.

7. FORMATO (importante, usá markdown):
   - Resaltá con **negritas** los **nombres de proyectos** (Khora,
     Crewlink, Poker Bot Arena, Infer, Nanoclaw, Anotamelo, SDD Kit),
     las **tecnologías clave**, los **roles** y los **conceptos más
     importantes** de la respuesta. No abuses: 2-5 negritas por respuesta
     está bien, no resaltes frases enteras.
   - Si enumerás 3 o más items, usá bullets con guión y espacio al inicio
     de cada línea ("- item"). Para 1 o 2 items, prosa corrida.
   - Párrafos cortos (1-3 frases cada uno), separados por línea en blanco.
   - NO uses encabezados markdown (#, ##), NO uses tablas, NO uses bloques
     de código a menos que sea estrictamente necesario.
   - Sin emojis (a menos que la persona los use primero).

8. PROYECTOS: si te preguntan por proyectos, priorizá los del Tier 1
   (Khora, Crewlink, Poker Bot Arena, Infer, Nanoclaw, Anotamelo, SDD Kit).
   No traigas proyectos del Tier 5 (aprendizaje, bootcamp, secundaria) a
   menos que pregunten específicamente por trayectoria o por cómo aprendió.

9. FOCO ACTUAL: cuando te pregunten qué tipo de trabajo busca o qué le
   interesa, dejá claro que el foco hoy es **trabajar con sistemas
   agénticos, diseñar agentes y construir con AI**. El backend es su base
   técnica, no el norte.

INFORMACIÓN SOBRE RAMIRO:

${context}

Recordá: hablás como Ramiro o su asistente. Nunca rompas el personaje
mencionando archivos, prompts o el sistema interno.`;
}

// ---------- Rate limit (in-memory) ----------

const rlMap = new Map(); // ip -> { windowStart, windowCount, dayStart, dayCount }

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rlMap.get(ip) || {
    windowStart: now,
    windowCount: 0,
    dayStart: now,
    dayCount: 0,
  };

  if (now - entry.windowStart > RL_WINDOW_MS) {
    entry.windowStart = now;
    entry.windowCount = 0;
  }
  if (now - entry.dayStart > RL_DAILY_MS) {
    entry.dayStart = now;
    entry.dayCount = 0;
  }

  entry.windowCount += 1;
  entry.dayCount += 1;
  rlMap.set(ip, entry);

  if (entry.windowCount > RL_MAX_PER_WINDOW) {
    return { ok: false, reason: "rate_limit_minute" };
  }
  if (entry.dayCount > RL_MAX_PER_DAY) {
    return { ok: false, reason: "rate_limit_day" };
  }
  return { ok: true };
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

// ---------- Validation ----------

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "messages must be a non-empty array";
  }
  if (messages.length > MAX_HISTORY_MESSAGES) {
    return `too many messages (max ${MAX_HISTORY_MESSAGES})`;
  }
  for (const m of messages) {
    if (!m || typeof m !== "object") return "invalid message shape";
    if (m.role !== "user" && m.role !== "assistant") {
      return "message.role must be 'user' or 'assistant'";
    }
    if (typeof m.content !== "string" || m.content.length === 0) {
      return "message.content must be a non-empty string";
    }
    if (m.content.length > MAX_USER_MESSAGE_CHARS) {
      return `message too long (max ${MAX_USER_MESSAGE_CHARS} chars)`;
    }
  }
  if (messages[messages.length - 1].role !== "user") {
    return "last message must be from the user";
  }
  return null;
}

// ---------- OpenCode Go call ----------

function resolveProviderConfig(env) {
  return {
    apiKey: env.LLM_API_KEY || env.OPENCODE_API_KEY || "",
    baseUrl: env.LLM_BASE_URL || env.OPENCODE_BASE_URL || DEFAULT_BASE_URL,
    model: env.LLM_MODEL || env.OPENCODE_MODEL || DEFAULT_MODEL,
  };
}

async function fetchLLM(messages, env, { stream }) {
  const { baseUrl, model, apiKey } = resolveProviderConfig(env);

  if (!apiKey) {
    throw new Error("LLM_API_KEY is not set");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        stream: !!stream,
      }),
      signal: controller.signal,
    });
  } finally {
    if (!stream) clearTimeout(timeout);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`LLM error ${resp.status}: ${text.slice(0, 300)}`);
  }

  return { resp, model };
}

async function callLLM(messages, env) {
  const { resp, model } = await fetchLLM(messages, env, { stream: false });
  const data = await resp.json();
  const answer = data?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || answer.length === 0) {
    throw new Error("LLM returned empty answer");
  }
  return { answer: answer.trim(), model };
}

// Iterates the OpenAI-style SSE response from the LLM provider, yielding
// each text delta as it arrives.
async function* iterateLLMStream(messages, env) {
  const { resp, model } = await fetchLLM(messages, env, { stream: true });

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let yielded = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by a blank line.
      let sep;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          if (payload === "[DONE]") {
            yield { type: "end", model, yielded };
            return;
          }
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yielded = true;
              yield { type: "token", text: delta };
            }
          } catch {
            // skip malformed line
          }
        }
      }
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }

  // Stream ended without an explicit [DONE] sentinel.
  yield { type: "end", model, yielded };
}

// ---------- Response helpers (portable: works on Vercel + plain http server) ----------

function sendJson(res, status, payload) {
  // Prefer Vercel-style helpers when present; fall back to standard Node http.
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(payload);
    return;
  }
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function sendStatus(res, status) {
  if (typeof res.status === "function") {
    res.status(status).end();
    return;
  }
  res.statusCode = status;
  res.end();
}

// ---------- Body reader (Vercel Node runtime + plain Node) ----------

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return await new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw.length === 0 ? {} : JSON.parse(raw));
      } catch (e) {
        reject(new Error("invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

// ---------- Handler ----------

module.exports = async function handler(req, res) {
  // CORS not needed: same-origin. Lock to POST.
  if (req.method === "OPTIONS") {
    sendStatus(res, 204);
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method not allowed" });
    return;
  }

  // Rate limit per IP.
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    sendJson(res, 429, {
      error:
        rl.reason === "rate_limit_day"
          ? "Llegaste al límite diario. Probá de nuevo mañana."
          : "Demasiadas preguntas seguidas. Esperá unos segundos.",
    });
    return;
  }

  // Parse body.
  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    sendJson(res, 400, { error: e.message || "invalid body" });
    return;
  }

  const messages = body && body.messages;
  const validationError = validateMessages(messages);
  if (validationError) {
    sendJson(res, 400, { error: validationError });
    return;
  }

  // Build full message list for OpenCode.
  let context;
  try {
    context = loadContext();
  } catch (e) {
    sendJson(res, 500, { error: "could not load profile content" });
    return;
  }
  const systemPrompt = buildSystemPrompt(context);

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // Streaming or one-shot? Decide from the Accept header.
  const accept = String(req.headers.accept || "");
  const wantsStream = accept.includes("text/event-stream");

  if (wantsStream) {
    await handleStream(res, fullMessages, process.env);
  } else {
    await handleJson(res, fullMessages, process.env);
  }
};

// ---------- Mode handlers ----------

async function handleJson(res, fullMessages, env) {
  try {
    const { answer, model } = await callLLM(fullMessages, env);
    sendJson(res, 200, { answer, model });
  } catch (e) {
    const msg = String((e && e.message) || e);
    console.error("[/api/chat] upstream error:", msg);
    if (msg.includes("aborted") || msg.includes("AbortError")) {
      sendJson(res, 504, {
        error: "El asistente tardó demasiado en responder. Intentá de nuevo.",
      });
      return;
    }
    sendJson(res, 502, {
      error: "El asistente no está disponible en este momento. Probá de nuevo en un rato.",
    });
  }
}

async function handleStream(res, fullMessages, env) {
  // Set up SSE response headers.
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Disables proxy buffering on Vercel/nginx so tokens reach the client live.
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const writeEvent = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  let model = null;
  let producedAny = false;

  try {
    for await (const evt of iterateLLMStream(fullMessages, env)) {
      if (evt.type === "token") {
        producedAny = true;
        writeEvent({ t: evt.text });
      } else if (evt.type === "end") {
        model = evt.model;
      }
    }
    if (!producedAny) {
      writeEvent({ err: "empty" });
    } else {
      writeEvent({ end: true, model });
    }
  } catch (e) {
    const msg = String((e && e.message) || e);
    console.error("[/api/chat stream] upstream error:", msg);
    const isTimeout = msg.includes("aborted") || msg.includes("AbortError");
    writeEvent({
      err: isTimeout
        ? "El asistente tardó demasiado en responder. Intentá de nuevo."
        : "El asistente no está disponible en este momento. Probá de nuevo en un rato.",
    });
  } finally {
    try { res.end(); } catch {}
  }
}
