const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");

const drawRoundRect = require("./ui/drawRoundRect");
const drawStatCard = require("./ui/drawStatCard");
const drawAvatar = require("./ui/drawAvatar");

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

   await drawAvatar(ctx, avatar, 655, 30, 170, "#a855f7"); 
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