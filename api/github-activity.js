// /api/github-activity.js
// Live GitHub activity widget for ram4-dev.
//
// Returns: profile (avatar/name/bio/location), contributions calendar
// (53-week heatmap with totals), recently-pushed public repos, and 14-day clone
// traffic for the projects featured on the landing page.
//
// Uses GraphQL v4 for profile+contributions (requires GITHUB_TOKEN) and falls
// back to REST-only data when no token is available (no heatmap then).
// Cached at the edge for 1h via vercel.json headers.

const GH_USER = "ram4-dev";
const REPO_LIMIT = 9;
const FEATURED_REPOS = [
  { owner: "ram4-dev", name: "solana_hackathon", label: "Compass" },
  { owner: "rober8b", name: "aleph-hackathon", label: "Nana Wallet" },
  { owner: "ram4-dev", name: "khora-landing", label: "Khora" },
  { owner: "ram4-dev", name: "pears-vault", label: "Hackvault" },
  { owner: "ram4-dev", name: "esp32-hermes-voice", label: "ESP32 Voice Agent" },
];
// Repos pinned to a fixed position regardless of push date (1-indexed).
const PINNED = [
  { name: 'security_agent_middleware', position: 2 },
];

const HIDE_REPOS = new Set([
  "presentation",
  "khora-landing",
  "khora_landing",
  "khora-frontend",
  "khora-front",
  "khora-backend",
  "khora_data_infra",
  "RamiroCS-hub",
  "nvim_config",
]);

// In-memory cache for warm invocations (process-scoped).
let MEM = { at: 0, payload: null };
const MEM_TTL_MS = 60 * 60 * 1000; // 1h

function authHeader() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const COMMON_HEADERS = {
  "User-Agent": "ram4.dev landing",
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function fetchReposREST() {
  const url = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed&type=owner`;
  const r = await fetch(url, { headers: { ...COMMON_HEADERS, ...authHeader() } });
  if (!r.ok) throw new Error(`github repos ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function fetchProfileGraphQL() {
  if (!authHeader().Authorization) return null;
  const query = `
    query($login: String!) {
      user(login: $login) {
        login
        name
        bio
        location
        avatarUrl(size: 240)
        url
        company
        createdAt
        followers { totalCount }
        following { totalCount }
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }`;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...COMMON_HEADERS,
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: GH_USER } }),
  });
  if (!r.ok) throw new Error(`github graphql ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const json = await r.json();
  if (json.errors) throw new Error(`graphql errors: ${JSON.stringify(json.errors).slice(0, 200)}`);
  return json.data && json.data.user;
}

async function fetchCloneTraffic() {
  if (!authHeader().Authorization) {
    return FEATURED_REPOS.map((repo) => ({
      ...repo,
      url: `https://github.com/${repo.owner}/${repo.name}`,
      available: false,
    }));
  }

  return Promise.all(FEATURED_REPOS.map(async (repo) => {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.name}/traffic/clones`;
    try {
      const r = await fetch(url, { headers: { ...COMMON_HEADERS, ...authHeader() } });
      if (!r.ok) {
        console.error(`[github-activity] clone traffic unavailable for ${repo.owner}/${repo.name}: ${r.status}`);
        return {
          ...repo,
          url: `https://github.com/${repo.owner}/${repo.name}`,
          available: false,
        };
      }
      const data = await r.json();
      return {
        ...repo,
        url: `https://github.com/${repo.owner}/${repo.name}`,
        available: true,
        count: Number(data.count) || 0,
        uniques: Number(data.uniques) || 0,
        window_days: 14,
      };
    } catch (err) {
      console.error(`[github-activity] clone traffic failed for ${repo.owner}/${repo.name}: ${err.message}`);
      return {
        ...repo,
        url: `https://github.com/${repo.owner}/${repo.name}`,
        available: false,
      };
    }
  }));
}

function shapeRepos(repos) {
  const shaped = repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .filter((r) => !HIDE_REPOS.has(r.name))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .map((r) => ({
      name: r.name,
      description: r.description || null,
      language: r.language || null,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      pushed_at: r.pushed_at,
      url: r.html_url,
      homepage: r.homepage || null,
      topics: r.topics || [],
    }));

  // Apply pinned positions.
  for (const pin of PINNED) {
    const idx = shaped.findIndex((r) => r.name === pin.name);
    if (idx === -1) continue;
    const [item] = shaped.splice(idx, 1);
    const insertAt = Math.min(pin.position - 1, shaped.length);
    shaped.splice(insertAt, 0, item);
  }

  return shaped.slice(0, REPO_LIMIT);
}



function shapeProfile(gqlUser) {
  if (!gqlUser) return null;
  const cc = gqlUser.contributionsCollection || {};
  const cal = cc.contributionCalendar || {};
  return {
    login: gqlUser.login,
    name: gqlUser.name,
    bio: gqlUser.bio,
    location: gqlUser.location,
    company: gqlUser.company,
    avatar_url: gqlUser.avatarUrl,
    url: gqlUser.url,
    created_at: gqlUser.createdAt,
    followers: gqlUser.followers && gqlUser.followers.totalCount,
    following: gqlUser.following && gqlUser.following.totalCount,
    public_repos: gqlUser.repositories && gqlUser.repositories.totalCount,
    activity: {
      total_contributions: cal.totalContributions || 0,
      commits: cc.totalCommitContributions || 0,
      pull_requests: cc.totalPullRequestContributions || 0,
      issues: cc.totalIssueContributions || 0,
    },
    calendar: (cal.weeks || []).map((w) => ({
      days: (w.contributionDays || []).map((d) => ({
        date: d.date,
        count: d.contributionCount,
        color: d.color,
      })),
    })),
  };
}

function computeTopLanguage(repos) {
  const counts = {};
  for (const r of repos) {
    if (!r.fork && !r.archived && r.language) {
      counts[r.language] = (counts[r.language] || 0) + 1;
    }
  }
  let top = null;
  let topN = 0;
  for (const [lang, n] of Object.entries(counts)) {
    if (n > topN) {
      top = lang;
      topN = n;
    }
  }
  return top;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const now = Date.now();
  if (MEM.payload && now - MEM.at < MEM_TTL_MS) {
    res.statusCode = 200;
    res.end(JSON.stringify(MEM.payload));
    return;
  }

  try {
    // Fetch profile, repos and featured-project traffic in parallel.
    const [profile, rawRepos, cloneTraffic] = await Promise.all([
      fetchProfileGraphQL().catch((e) => {
        console.error("[github-activity] graphql failed:", e.message);
        return null;
      }),
      fetchReposREST(),
      fetchCloneTraffic(),
    ]);

    const repos = shapeRepos(rawRepos);
    const payload = {
      user: GH_USER,
      fetched_at: new Date().toISOString(),
      profile: shapeProfile(profile),
      top_language: computeTopLanguage(rawRepos),
      repos,
      clone_traffic: cloneTraffic,
    };
    MEM = { at: now, payload };
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (err) {
    if (MEM.payload) {
      res.statusCode = 200;
      res.setHeader("X-Stale", "1");
      res.end(JSON.stringify({ ...MEM.payload, stale: true }));
      return;
    }
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
