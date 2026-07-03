const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");
const drawRoundRect = require("./ui/drawRoundRect");

function shorten(text, max = 34) {
  if (!text) return "Brak danych";
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

function drawCard(ctx, x, y, w, h, title, value, accent = "#8b5cf6") {
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  drawRoundRect(ctx, x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 36, y + h / 2, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 17px Arial";
  ctx.fillText(title.toUpperCase(), x + 75, y + 33);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";

  const fittedValue = fitText(ctx, value || "Brak", w - 95);
  ctx.fillText(fittedValue, x + 75, y + 68);
}

async function createBossPanel({ boss, stats }) {
  const canvas = createCanvas(1000, 620);
  const ctx = canvas.getContext("2d");

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
  ctx.fillText(`Poziom: ${boss.level || "?"}  •  Kategoria: ${boss.category || "?"}`, 60, 128);

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
    const bossImage = await loadImage(imagePath);

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

  drawCard(ctx, 60, 285, 270, 90, "Wyprawy", stats.runs, "#a855f7");
  drawCard(ctx, 360, 285, 270, 90, "Średnia", stats.averageAttendance, "#38bdf8");
  drawCard(ctx, 60, 395, 270, 90, "Top organizator", stats.topOrganizer, "#22c55e");
  drawCard(ctx, 360, 395, 270, 90, "Liczba lootów", stats.lootCount, "#f97316");
  drawCard(ctx, 660, 350, 270, 90, "Top zwycięzca", stats.topWinner, "#facc15");
  drawCard(ctx, 660, 460, 270, 90, "Ostatnia wyprawa", stats.lastRun, "#22d3ee");

  ctx.fillStyle = "rgba(139, 92, 246, 0.18)";
  drawRoundRect(ctx, 60, 515, 570, 55, 14);
  ctx.fill();

  ctx.strokeStyle = "rgba(139, 92, 246, 0.75)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 60, 515, 570, 55, 14);
  ctx.stroke();

  ctx.fillStyle = "#e879f9";
  ctx.font = "bold 22px Arial";
  ctx.fillText("OSTATNI LOOT:", 85, 550);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(fitText(ctx, stats.lastLoot || "Brak danych", 320), 260, 550);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("HeroBot • Boss Analytics", 60, 595);

  return canvas.encode("png");
}

module.exports = createBossPanel;