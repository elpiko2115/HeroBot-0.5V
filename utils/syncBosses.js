const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const SOURCES = [
  { url: "https://margoworld.pl/npc/elite2", category: "E2" },
  { url: "https://margoworld.pl/npc/heros", category: "Hero" },
  { url: "https://margoworld.pl/npc/titan", category: "Titan" },
  { url: "https://margoworld.pl/npc/kolos", category: "Colossus" }
];

function createId(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseLocation(location) {
  const coordsMatch = location.match(/\(([^)]+)\)$/);

  if (!coordsMatch) {
    return {
      map: location,
      coordinates: ""
    };
  }

  return {
    map: location.replace(/\s*\([^)]+\)$/, "").trim(),
    coordinates: coordsMatch[1]
  };
}

async function parseSource(source) {
  const { data } = await axios.get(source.url, {
    headers: {
      "User-Agent": "HeroBot"
    }
  });

  const $ = cheerio.load(data);
  const bosses = [];

  $("table tr").slice(1).each((_, row) => {
const cells = $(row).find("td");

if (cells.length < 3) return;

const image = $(cells[0]).find("img").attr("src") || "";

const npc = $(cells[1]).text().replace(/\s+/g, " ").trim();

const location = $(cells[2]).text().replace(/\s+/g, " ").trim();

    const match = npc.match(/^(.*?)\s*\((\d+)lvl\)$/i);
    if (!match) return;

    const name = match[1].trim();
    const parsedLocation = parseLocation(location);

    bosses.push({
      id: createId(name),
      name,
      category: source.category,
      level: Number(match[2]),
      map: parsedLocation.map,
      coordinates: parsedLocation.coordinates,
      emoji: "🎯",
      image,
      imageFile: `${createId(name)}.png`,
      respawn: "",
      sourceUrl: source.url,
      lastSync: new Date().toISOString()
    });
  });

  return bosses;
}

async function syncBosses() {
  const all = [];

  for (const source of SOURCES) {
    console.log("Pobieram:", source.category);

    const list = await parseSource(source);

    console.log(" ->", list.length);

    all.push(...list);
  }

  fs.writeFileSync(
    "data/bosses.json",
    JSON.stringify(all, null, 2),
    "utf8"
  );

  console.log("");
  console.log("Zapisano", all.length, "bossów.");

  return {
    total: all.length,
    bosses: all
  };
}

module.exports = syncBosses;