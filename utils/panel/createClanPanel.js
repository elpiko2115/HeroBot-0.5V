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
    calendar: await loadLocalImage(path.join(iconsPath, "calendar.png")),
    clock: await loadLocalImage(path.join(iconsPath, "clock.png")),
    gift: await loadLocalImage(path.join(iconsPath, "gift.png")),
    crown: await loadLocalImage(path.join(iconsPath, "crown.png")),
    party: await loadLocalImage(path.join(iconsPath, "party.png")),
    trophy: await loadLocalImage(path.join(iconsPath, "trophy.png")),
    users: await loadLocalImage(path.join(iconsPath, "party.png"))
  };
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

  if (icon) ctx.drawImage(icon, x + 16, y + 24, 46, 46);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 16px Arial";
  ctx.fillText(title.toUpperCase(), x + 75, y + 32);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 27px Arial";
  ctx.fillText(fitText(ctx, value, w - 95), x + 75, y + 68);
}

async function createClanPanel(stats) {
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
  ctx.font = "bold 52px Arial";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 16;
  ctx.fillText("Statystyki klanu", 60, 95);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#22d3ee";
  ctx.font = "24px Arial";
  ctx.fillText("HeroBot • Clan Analytics", 60, 132);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 165);
  ctx.lineTo(930, 165);
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 28px Arial";
  ctx.fillText("AKTYWNOŚĆ", 60, 215);

  drawCard(ctx, 60, 245, 270, 90, "Wyprawy dziś", stats.runsToday, icons.swords);
  drawCard(ctx, 365, 245, 270, 90, "W tym tygodniu", stats.runsWeek, icons.calendar);
  drawCard(ctx, 670, 245, 270, 90, "W tym miesiącu", stats.runsMonth, icons.clock);

  drawCard(ctx, 60, 365, 270, 90, "Looty miesiąc", stats.lootMonth, icons.gift);
  drawCard(ctx, 365, 365, 270, 90, "Aktywni gracze", stats.activePlayers, icons.users);
  drawCard(ctx, 670, 365, 270, 90, "Boss tygodnia", stats.bossOfWeek, icons.trophy);

// Lewa belka
ctx.fillStyle = "rgba(139,92,246,0.18)";
drawRoundRect(ctx, 60, 495, 420, 62, 16);
ctx.fill();

ctx.strokeStyle = "rgba(139,92,246,0.75)";
ctx.lineWidth = 2;
drawRoundRect(ctx, 60, 495, 420, 62, 16);
ctx.stroke();

ctx.drawImage(icons.crown, 80, 507, 38, 38);

ctx.fillStyle = "#e879f9";
ctx.font = "bold 20px Arial";
ctx.fillText("TOP ORGANIZATOR", 135, 523);

ctx.fillStyle = "#ffffff";
ctx.font = "bold 22px Arial";
ctx.fillText(fitText(ctx, stats.topOrganizer, 240), 135, 548);

// Prawa belka
ctx.fillStyle = "rgba(139,92,246,0.18)";
drawRoundRect(ctx, 520, 495, 420, 62, 16);
ctx.fill();

ctx.strokeStyle = "rgba(139,92,246,0.75)";
ctx.lineWidth = 2;
drawRoundRect(ctx, 520, 495, 420, 62, 16);
ctx.stroke();

ctx.drawImage(icons.party, 540, 507, 38, 38);

ctx.fillStyle = "#e879f9";
ctx.font = "bold 20px Arial";
ctx.fillText("TOP UCZESTNIK", 595, 523);

ctx.fillStyle = "#ffffff";
ctx.font = "bold 22px Arial";
ctx.fillText(fitText(ctx, stats.topParticipant, 240), 595, 548);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("HeroBot v1.0 • Panel klanu", 60, 595);

  return canvas.encode("png");
}

module.exports = createClanPanel;