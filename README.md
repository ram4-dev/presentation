# ram4.dev — personal landing with AI chat

Personal landing of Ramiro Carnicer Souble (`ram4.dev`).

The home is a chat-first interface backed by an LLM that answers questions about Ramiro using the Markdown files under `/content`. Below the chat the page keeps the traditional sections (work, what I do, writing, philosophy, contact).

## Stack

- Static `index.html` with Tailwind via CDN (no build step).
- One Vercel serverless function: `/api/chat.js`.
- LLM provider: any OpenAI-compatible `/chat/completions` endpoint. Default: **[Groq](https://groq.com)** with `llama-3.3-70b-versatile`. Also tested with **[OpenCode Go](https://opencode.ai/go)**.
- Profile content lives as plain Markdown files in `/content`.

```
.
├── api/
│   └── chat.js          ← serverless proxy to the LLM provider
├── content/             ← single source of truth for the assistant
│   ├── identity.md
│   ├── about.md
│   ├── experience.md
│   ├── skills.md
│   ├── philosophy.md
│   ├── projects.md
│   ├── repositories.md
│   ├── writing.md
│   ├── contact.md
│   └── faq.md
├── index.html           ← landing + chat UI
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

## How the assistant works

1. On cold start the function loads every `*.md` from `/content` and caches them.
2. Each request appends a strict system prompt (rules: same-language reply, professional/close tone, never expose internal sources, never invent info, prioritize Tier 1 projects).
3. The function POSTs to `${LLM_BASE_URL}/chat/completions` with a bearer token.
4. The answer is returned as JSON to the browser.

Rate limited per IP: 12 req/min, 200 req/day, 2.000 chars per message, 20 messages of history max.

## Editing the assistant's knowledge

To change what the assistant knows, edit the Markdown files in `/content` and redeploy. No code change needed.

The assistant is told to prioritize Tier 1 projects (Khora, Crewlink, Poker Bot Arena, Infer, Nanoclaw, Anotamelo, SDD Kit) and to avoid surfacing learning-path repos unless explicitly asked.

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel. Framework preset: **Other**. No build command needed; Vercel auto-detects `/api/*.js`.
3. Pick an LLM provider and get an API key (see [Provider config](#provider-config) below).
4. Set the environment variables in Vercel → Settings → Environment Variables:

   | Variable | Required | Default |
   |---|---|---|
   | `LLM_API_KEY` | yes | — |
   | `LLM_MODEL` | no | `llama-3.3-70b-versatile` |
   | `LLM_BASE_URL` | no | `https://api.groq.com/openai/v1` |

   The legacy names `OPENCODE_API_KEY` / `OPENCODE_MODEL` / `OPENCODE_BASE_URL` are still accepted as fallbacks.

5. Deploy. Done.

## Provider config

Any OpenAI-compatible `/chat/completions` endpoint works. Three common options:

### Groq (default — fast, generous free tier)

```env
LLM_API_KEY=gsk_...
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
```

Get a key: https://console.groq.com/keys

Other Groq models worth trying:

- `llama-3.3-70b-versatile` — higher quality, but only 12k TPM on free tier
- `moonshotai/kimi-k2-instruct` — strong instruction following
- `qwen/qwen3-32b` — great bilingual ES/EN
- `openai/gpt-oss-120b` — highest quality available on Groq today

Note on privacy: Groq's free tier may use requests to improve the service. For public profile data this is fine; if it bothers you, use the paid tier or another provider.

### OpenCode Go

```env
LLM_API_KEY=...
LLM_BASE_URL=https://opencode.ai/zen/go/v1
LLM_MODEL=qwen3.6-plus
```

Get a key: subscribe to Go ($5 first month, then $10/month) at https://opencode.ai

Models available on Go are listed at https://opencode.ai/docs/go.

### OpenAI (or any OpenAI-compatible provider)

```env
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Same shape works for OpenRouter, Together, Anyscale, Fireworks, etc.

## Local development

The site is mostly a static `index.html`, so opening the file directly previews most of the layout. To exercise the real `/api/chat` endpoint locally, use the Vercel CLI:

```bash
npm i -g vercel
cp .env.example .env       # then fill in LLM_API_KEY
vercel dev
```

Then open `http://localhost:3000`.

## Switching the model

Change the `LLM_MODEL` env var in Vercel and redeploy. No code change needed. If you want to switch provider entirely, change all three env vars (`LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`) together.

## Privacy

All Markdown under `/content` is public on purpose: it's the information the assistant is allowed to talk about. Don't put anything sensitive there.

User chat messages are sent to whichever LLM provider you configured, subject to its data policy.
