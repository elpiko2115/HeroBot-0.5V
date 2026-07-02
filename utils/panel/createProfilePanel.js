const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getPlayerRank(joinedParties) {
  if (joinedParties >= 500) return { name: "Bohater Margonem", color: "#22d3ee", icon: "hero.png" };
  if (joinedParties >= 250) return { name: "Legenda", color: "#f97316", icon: "legend.png" };
  if (joinedParties >= 100) return { name: "Mistrz Wypraw", color: "#facc15", icon: "master.png" };
  if (joinedParties >= 50) return { name: "Weteran", color: "#38bdf8", icon: "veteran.png" };
  if (joinedParties >= 25) return { name: "Awanturnik", color: "#a855f7", icon: "adventurer.png" };
  if (joinedParties >= 10) return { name: "Poszukiwacz", color: "#84cc16", icon: "seeker.png" };
  if (joinedParties >= 5) return { name: "Łowca", color: "#e5e7eb", icon: "hunter.png" };
  if (joinedParties >= 1) return { name: "Nowicjusz", color: "#22c55e", icon: "novice.png" };
  return { name: "Bez rangi", color: "#64748b", icon: "novice.png" };
}

function drawStatCard(ctx, x, y, icon, title, value) {
  ctx.save();

  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  drawRoundRect(ctx, x, y, 185, 88, 16);
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "rgba(139, 92, 246, 0.65)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.drawImage(icon, x + 16, y + 16, 30, 30);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 18px Arial";
  ctx.fillText(title.toUpperCase(), x + 58, y + 36);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 32px Arial";
  ctx.fillText(String(value), x + 58, y + 70);

  ctx.restore();
}

async function createProfilePanel(user, stats) {
  const canvas = createCanvas(900, 420);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 900, 420);
  gradient.addColorStop(0, "#070b16");
  gradient.addColorStop(1, "#111827");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 12;
  ctx.fillText("Profil gracza", 50, 70);
  ctx.shadowBlur = 0;

  ctx.font = "bold 42px Arial";
  ctx.fillText(user.username, 50, 130);
 
const rank = getPlayerRank(stats.joinedParties);
const rankIcon = await loadImage(path.join(__dirname, "../../assets/ranks", rank.icon));

ctx.drawImage(rankIcon, 320, 58, 104, 104);

ctx.strokeStyle = rank.color;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(300, 168);
ctx.lineTo(445, 168);
ctx.stroke();

ctx.fillStyle = rank.color;
ctx.font = "bold 28px Arial";
ctx.textAlign = "center";
ctx.fillText(rank.name.toUpperCase(), 372, 202);
ctx.textAlign = "left";
  try {
    const avatar = await loadImage(
      user.displayAvatarURL({ extension: "png", size: 256 })
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(740, 115, 85, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 655, 30, 170, 170);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(740, 115, 88, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#a855f7";
    ctx.stroke();
  } catch {}

  const sword = await loadImage(path.join(__dirname, "../../assets/icons/sword.png"));
  const crown = await loadImage(path.join(__dirname, "../../assets/icons/crown.png"));
  const gift = await loadImage(path.join(__dirname, "../../assets/icons/gift.png"));
  const chart = await loadImage(path.join(__dirname, "../../assets/icons/chart.png"));

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Statystyki", 50, 195);

  drawStatCard(ctx, 50, 220, sword, "Wyprawy", stats.joinedParties);
  drawStatCard(ctx, 255, 220, crown, "Organiz.", stats.organizedParties);
  drawStatCard(ctx, 460, 220, gift, "Looty", stats.wonLoots);
  drawStatCard(ctx, 665, 220, chart, "Rate", `${stats.winRate}%`);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("HeroBot v1.0 • Profil gracza", 50, 390);

  return canvas.encode("png");
}

module.exports = createProfilePanel;