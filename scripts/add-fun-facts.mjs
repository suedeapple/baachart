import fs from "fs";

const API_KEY = "process.env.ANTHROPIC_API_KEY";
const JSON_PATH = new URL("../public/sheep.json", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

async function generateFact(countryName) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `Write a fun sheep fact about ${countryName}. 1-2 sentences, 50 words max, up to 2 sheep puns, plain text only (no markdown, no bullet points, no quotes), funny and based on real facts about sheep breeds or wool in that country, kid-safe, nothing about eating or killing sheep. Return only the fact, nothing else.`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.content[0].text.trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let updated = 0;
let skipped = 0;

for (let i = 0; i < data.countries.length; i++) {
  const c = data.countries[i];
  // regenerate all

  try {
    const fact = await generateFact(c.country);
    data.countries[i].funFact = fact;
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
    updated++;
    console.log(`[${i + 1}/${data.countries.length}] ${c.country}\n  → ${fact}\n`);
  } catch (err) {
    console.error(`[${i + 1}] ${c.country}: ERROR - ${err.message}`);
  }

  await sleep(400);
}

console.log(`\nFinished. Updated: ${updated}, Skipped (already had fact): ${skipped}`);
