const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");
const fs = require("fs");
const drawRoundRect = require("./ui/drawRoundRect");

async function loadLocalImage(filePath) {
  return loadImage(fs.readFileSync(filePath));
}

async function loadIcons() {
  const iconsPath = path.join(__dirname, "../../assets/icons");

  return {
    swords: await loadLocalImage(path.join(iconsPath, "sword.png")),
    party: await loadLocalImage(path.join(iconsPath, "party.png")),
    crown: await loadLocalImage(path.join(iconsPath, "crown.png")),
    chest: await loadLocalImage(path.join(iconsPath, "gift.png")),
    trophy: await loadLocalImage(path.join(iconsPath, "trophy.png")),
    calendar: await loadLocalImage(path.join(iconsPath, "clock.png")),
    gem: await loadLocalImage(path.join(iconsPath, "gem.png"))
  };
}

function shorten(text, max = 34) {
  if (!text) return "Brak danych";
  text = String(text);
  return text.length > max ? text.slice(0, max - 3) + "..." : text;
}

function fitText(ctx, text, maxWidth) {
  text = String(text ?? "Brak");

  if (ctx.measureText(text).width <= maxWidth) return text;

  while (text.length > 0 && ctx.measureText(text + "...").width > maxWidth) {
    text = text.slice(0, -1);
  }

  return text + "...";
}

function drawCard(ctx, x, y, w, h, title, value, icon) {
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  drawRoundRect(ctx, x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  if (icon) {
    ctx.drawImage(icon, x + 16, y + 22, 46, 46);
  }

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 16px Arial";
  ctx.fillText(title.toUpperCase(), x + 75, y + 32);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 27px Arial";
  const fittedValue = fitText(ctx, value || "Brak", w - 95);
  ctx.fillText(fittedValue, x + 75, y + 68);
}

async function createBossPanel({ boss, stats }) {
  const canvas = createCanvas(1000, 620);
  const ctx = canvas.getContext("2d");

  const icons = await loadIcons();

  const gradient = ctx.createLinearGradient(0, 0, 1000, 620);
  gradient.addColorStop(0, "#050816");
  gradient.addColorStop(1, "#111827");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 16;
  ctx.fillText(shorten(boss.name, 32), 60, 85);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "22px Arial";
  ctx.fillText(
    `Poziom: ${boss.level || "?"}  •  Kategoria: ${boss.category || "?"}`,
    60,
    128
  );

  ctx.fillStyle = "#22d3ee";
  ctx.fillText(`Mapa: ${shorten(boss.map, 46)}`, 60, 162);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 190);
  ctx.lineTo(600, 190);
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 28px Arial";
  ctx.fillText("STATYSTYKI BOSSA", 60, 240);

  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 252);
  ctx.lineTo(330, 252);
  ctx.stroke();

  try {
    const imagePath = path.join(__dirname, "../../assets/bosses", boss.imageFile);
    const bossImage = await loadLocalImage(imagePath);

    ctx.fillStyle = "rgba(139, 92, 246, 0.18)";
    drawRoundRect(ctx, 650, 70, 280, 250, 24);
    ctx.fill();

    ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 650, 70, 280, 250, 24);
    ctx.stroke();

    ctx.drawImage(bossImage, 705, 95, 170, 170);
  } catch {
    ctx.fillStyle = "rgba(139, 92, 246, 0.18)";
    drawRoundRect(ctx, 650, 70, 280, 250, 24);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Brak grafiki", 710, 200);
  }

  drawCard(ctx, 60, 285, 270, 90, "Wyprawy", stats.runs, icons.swords);
  drawCard(ctx, 360, 285, 270, 90, "Średnia", stats.averageAttendance, icons.party);
  drawCard(ctx, 60, 395, 270, 90, "Top organizator", stats.topOrganizer, icons.crown);
  drawCard(ctx, 360, 395, 270, 90, "Liczba lootów", stats.lootCount, icons.chest);
  drawCard(ctx, 660, 350, 270, 90, "Top zwycięzca", stats.topWinner, icons.trophy);
  drawCard(ctx, 660, 460, 270, 90, "Ostatnia wyprawa", stats.lastRun, icons.calendar);

  ctx.fillStyle = "rgba(139, 92, 246, 0.18)";
  drawRoundRect(ctx, 60, 515, 570, 55, 14);
  ctx.fill();

  ctx.strokeStyle = "rgba(139, 92, 246, 0.75)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 60, 515, 570, 55, 14);
  ctx.stroke();

  ctx.drawImage(icons.gem, 82, 524, 38, 38);

  ctx.fillStyle = "#e879f9";
  ctx.font = "bold 22px Arial";
  ctx.fillText("OSTATNI LOOT:", 135, 550);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(fitText(ctx, stats.lastLoot || "Brak danych", 300), 310, 550);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("HeroBot • Boss Analytics", 60, 595);

  return canvas.encode("png");
}

module.exports = createBossPanel;