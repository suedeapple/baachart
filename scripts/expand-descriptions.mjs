import fs from "fs";

const jsonPath = "./public/sheep.json";
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const scenicPhrases = [
  "sweeping mountain views",
  "coastal horizons and bright skies",
  "rolling countryside and open pasture",
  "historic skylines and old stone streets",
  "river valleys and green plains",
  "sunlit highlands and quiet villages",
  "dramatic cliffs, lakes, and forests",
  "wide grasslands shaped by wind and weather"
];

const culturePhrases = [
  "beloved musicians, writers, and artists",
  "famous athletes and unforgettable sporting moments",
  "storied festivals and deep local traditions",
  "legendary food, fashion, and craftsmanship",
  "well-known films, songs, and iconic pop culture",
  "historic milestones that still shape identity",
  "landmark cities and world-recognized architecture",
  "famous celebrations that bring communities together"
];

const eventPhrases = [
  "historic victories",
  "world-stage celebrations",
  "national turning points",
  "cultural renaissances",
  "era-defining performances",
  "moments that inspired generations",
  "events remembered far beyond its borders",
  "chapters of history that still echo today"
];

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function buildDescription(countryName, pun, index) {
  const scenic = pick(scenicPhrases, index);
  const culture = pick(culturePhrases, index + 3);
  const event = pick(eventPhrases, index + 5);
  const woolPun = pun || `${countryName} is truly baa-rilliant`;

  const p1 =
    `${countryName} is a woolly wonder where ${scenic} set the stage for unforgettable travel stories and everyday beauty. ` +
    `${woolPun}, and the local flock would gladly guide you from postcard-famous places to hidden corners that feel quietly magical.`;

  const p2 =
    `Beyond the scenery, ${countryName} shines through ${culture}, plus ${event} that gave the world something to cheer for and remember. ` +
    `In true sheep-themed style, this is a place where culture, pride, and playful "ewe" energy all graze together in one seriously fleece-tastic national story.`;

  return `<p>${p1}</p>\n<p>${p2}</p>`;
}

for (let i = 0; i < data.countries.length; i += 1) {
  const country = data.countries[i];
  country.description = buildDescription(country.country, country.pun, i);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Updated descriptions with HTML paragraphs for ${data.countries.length} countries.`);
