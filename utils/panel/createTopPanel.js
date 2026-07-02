const { createCanvas } = require("@napi-rs/canvas");
const theme = require("./ui/theme");
const drawRoundRect = require("./ui/drawRoundRect");

function getMedal(index) {
  if (index === 0) return "1";
  if (index === 1) return "2";
  if (index === 2) return "3";
  return `${index + 1}`;
}

async function createTopPanel({ title, rows, type }) {
  const canvas = createCanvas(900, 520);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 900, 520);
  gradient.addColorStop(0, theme.backgroundStart);
  gradient.addColorStop(1, theme.backgroundEnd);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = theme.title;
  ctx.font = "bold 38px Arial";
  ctx.shadowColor = theme.border;
  ctx.shadowBlur = 12;
  ctx.fillText(title, 50, 70);
  ctx.shadowBlur = 0;

  ctx.fillStyle = theme.muted;
  ctx.font = "20px Arial";
  ctx.fillText("Ranking TOP 10", 50, 105);

  const startY = 135;

  rows.slice(0, 10).forEach((row, index) => {
    const y = startY + index * 34;

    ctx.fillStyle = index < 3
      ? "rgba(139, 92, 246, 0.28)"
      : "rgba(15, 23, 42, 0.65)";

    drawRoundRect(ctx, 50, y, 800, 28, 8);
    ctx.fill();

    ctx.fillStyle = index === 0 ? "#facc15" : index === 1 ? "#cbd5e1" : index === 2 ? "#fb923c" : theme.text;
    ctx.font = "bold 20px Arial";
    ctx.fillText(getMedal(index), 70, y + 21);

    ctx.fillStyle = theme.text;
    ctx.font = "bold 20px Arial";

    const label =
  row.label ||
  row.username ||
  row.boss_name ||
  "Nieznany gracz";
    ctx.fillText(label, 125, y + 21);

    ctx.textAlign = "right";
    ctx.fillStyle = theme.warning;
    ctx.fillText(String(row.total), 825, y + 21);
    ctx.textAlign = "left";
  });

  ctx.font = "20px Arial";
  ctx.fillStyle = theme.muted;
  ctx.fillText(`HeroBot v1.0 • ${type}`, 50, 485);

  return canvas.encode("png");
}

module.exports = createTopPanel;