import fs from "node:fs";

function loadDotEnv() {
  if (!fs.existsSync(".env")) return;
  const txt = fs.readFileSync(".env", "utf8");
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv();

const apiKey =
  process.env.ANTHROPIC_API_KEY ||
  process.env.CLAUDE_API_KEY ||
  process.env.CLAUDE_APIKEY ||
  process.env.API_KEY;

if (!apiKey) {
  console.log("NO_KEY_FOUND");
  process.exit(1);
}

const model = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest";

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model,
    max_tokens: 64,
    messages: [{ role: "user", content: "Reply exactly with: ok" }],
  }),
});

const txt = await res.text();
console.log(`STATUS ${res.status}`);
console.log(txt.slice(0, 1200));
