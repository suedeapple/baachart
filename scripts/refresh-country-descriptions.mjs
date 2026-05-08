import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const JSON_PATH = path.join(ROOT, "public", "sheep.json");
const SECTION_KEYS = [
  "Overview",
  "Geography",
  "History",
  "Culture",
  "Economy",
  "Food",
  "Tourism",
  "People",
  "Nature",
  "Fun Facts",
];

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripCodeFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

function tryExtractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStatusFromError(err) {
  const msg = String(err);
  const m = msg.match(/Anthropic API error\s+(\d{3})/i);
  return m ? Number(m[1]) : null;
}

function getRetryDelayMs(err, attempt) {
  const status = getStatusFromError(err);
  const jitter = Math.floor(Math.random() * 700);

  // Handle transient platform pressure and rate limits with stronger backoff.
  if (status === 529 || status === 429 || status === 503) {
    return Math.min(60000, 2500 * 2 ** (attempt - 1)) + jitter;
  }

  // Default retry backoff for other failures.
  return Math.min(15000, 1200 * 2 ** (attempt - 1)) + jitter;
}

async function callClaude({ apiKey, model, country, iso2code, iso3code }) {
  const prompt = [
    "You are writing data for a sheep-themed country explorer app.",
    "Return ONLY compact JSON with this exact schema:",
    '{"sections":{"Overview":"string","Geography":"string","History":"string","Culture":"string","Economy":"string","Food":"string","Tourism":"string","People":"string","Nature":"string","Fun Facts":"string"}}',
    "Requirements:",
    `- Country: ${country} (${iso2code.toUpperCase()}/${iso3code})`,
    "- Do not include a pun field.",
    "- Fill every section with 1 short paragraph, ideally 25-45 words.",
    "- Overview: concise intro with sheep-themed tone.",
    "- Geography: real regions, terrain, climate, rivers/mountains/coasts as relevant.",
    "- History: key events or eras, factual and brief.",
    "- Culture: arts, music, language, traditions, festivals, notable customs.",
    "- Economy: major industries and economic profile, factual.",
    "- Food: iconic dishes/ingredients and food culture.",
    "- Tourism: major destinations and landmarks (real places only).",
    "- People: notable people or broad demographics/identity context (factual, respectful).",
    "- Nature: wildlife, ecosystems, parks, and geographic highlights.",
    "- Fun Facts: 2-4 concise factual tidbits in one paragraph.",
    "- Keep wording concise so the full JSON stays compact.",
    "- Include sheep-related info where relevant (breeds, pastoral regions, wool, farming).",
    "- Tone: fun, witty, and humorous, but family-friendly and never vulgar.",
    "- Use natural sheep wordplay where it fits: baa, fleece, shear, flock, ewe, wool, lamb.",
    "- Avoid forced or repetitive jokes; keep the humor light and clever.",
    "- Do not invent fake places/people/events.",
    "- Do not use markdown, lists, HTML, or code fences. JSON only.",
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2200,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status}: ${responseText.slice(0, 400)}`);
  }

  const parsedResponse = JSON.parse(responseText);
  const combinedText = (parsedResponse.content || [])
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();

  if (!combinedText) {
    throw new Error("Empty text response from Claude");
  }

  const jsonText = stripCodeFences(combinedText);
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    const extracted = tryExtractJsonObject(jsonText);
    if (!extracted) {
      throw new Error("Claude response was not valid JSON");
    }
    data = JSON.parse(extracted);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Claude response was not a JSON object");
  }
  if (!data.sections || typeof data.sections !== "object") {
    throw new Error("Claude response missing required fields");
  }

  const sections = {};
  for (const key of SECTION_KEYS) {
    if (typeof data.sections[key] !== "string") {
      throw new Error(`Claude response missing section: ${key}`);
    }
    sections[key] = data.sections[key].trim();
  }

  return {
    sections,
  };
}

async function resolveModel(apiKey) {
  if (process.env.CLAUDE_MODEL && process.env.CLAUDE_MODEL.trim()) {
    return process.env.CLAUDE_MODEL.trim();
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      return "claude-sonnet-4-6";
    }

    const body = await response.json();
    const ids = new Set((body?.data || []).map((m) => m.id));
    const preferred = [
      "claude-sonnet-4-6",
      "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001",
      "claude-opus-4-7",
    ];

    for (const id of preferred) {
      if (ids.has(id)) {
        return id;
      }
    }

    const first = body?.data?.[0]?.id;
    return typeof first === "string" ? first : "claude-sonnet-4-6";
  } catch {
    return "claude-sonnet-4-6";
  }
}

async function main() {
  loadDotEnv(ENV_PATH);

  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.CLAUDE_APIKEY ||
    process.env.API_KEY;

  if (!apiKey) {
    throw new Error("No Claude API key found. Set ANTHROPIC_API_KEY or CLAUDE_API_KEY in .env");
  }

  const model = await resolveModel(apiKey);
  const dryRun = process.argv.includes("--dry-run");
  const maxAttempts = Number(process.env.CLAUDE_MAX_ATTEMPTS || "8");
  const startCountryArg = process.argv.find((arg) => arg.startsWith("--start-country="));
  const startCountry = (startCountryArg ? startCountryArg.slice("--start-country=".length) : process.env.CLAUDE_START_COUNTRY || "").trim();

  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const db = JSON.parse(raw);

  if (!Array.isArray(db.countries)) {
    throw new Error("Invalid sheep.json: countries array missing");
  }

  let startIndex = 0;
  if (startCountry) {
    const idx = db.countries.findIndex((c) => String(c.country).toLowerCase() === startCountry.toLowerCase());
    if (idx === -1) {
      throw new Error(`Start country not found: ${startCountry}`);
    }
    startIndex = idx;
  }

  console.log(`Refreshing descriptions for ${db.countries.length} countries using model ${model}...`);
  if (startIndex > 0) {
    console.log(`Resuming from ${db.countries[startIndex].country} (${startIndex + 1}/${db.countries.length})`);
  }

  for (let i = startIndex; i < db.countries.length; i += 1) {
    const c = db.countries[i];
    const label = `${i + 1}/${db.countries.length} ${c.country}`;

    let lastErr = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const out = await callClaude({
          apiKey,
          model,
          country: c.country,
          iso2code: c.iso2code,
          iso3code: c.iso3code,
        });

        c.sections = out.sections;
        // Keep existing page compatibility while new UI migrates to sectioned content.
        c.description = `<p>${escapeHtml(out.sections.Overview)}</p>\n<p>${escapeHtml(out.sections.Culture)}</p>`;

        console.log(`OK ${label}`);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        const wait = getRetryDelayMs(err, attempt);
        console.warn(`Retry ${attempt}/${maxAttempts} ${label} after ${wait}ms: ${String(err).slice(0, 240)}`);
        await delay(wait);
      }
    }

    if (lastErr && (!c.sections || !c.description)) {
      throw new Error(`Failed for ${c.country}: ${String(lastErr)}`);
    }

    // Flush periodically to avoid losing progress on long runs.
    if (!dryRun && (i + 1) % 10 === 0) {
      db.generatedAt = new Date().toISOString();
      fs.writeFileSync(JSON_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
      console.log(`Saved progress at ${i + 1} countries`);
    }

    await delay(350);
  }

  if (!dryRun) {
    db.generatedAt = new Date().toISOString();
    fs.writeFileSync(JSON_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
    console.log("Done. sheep.json updated.");
  } else {
    console.log("Dry run complete (no file writes).");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
