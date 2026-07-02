const path = require("path");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const theme = require("./panel/theme");
const drawBackground = require("./panel/drawBackground");

function drawText(ctx, text, x, y, options = {}) {
  ctx.fillStyle = options.color || "#f9fafb";
  ctx.font = `${options.weight || "400"} ${options.size || 24}px Arial`;
  ctx.fillText(text, x, y);
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawProgress(ctx, x, y, current, max) {
  const size = 26;
  const gap = 8;
  const total = Math.min(max || 1, 10);

  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i < current ? "#22c55e" : "#d1d5db";
    ctx.fillRect(x + i * (size + gap), y, size, size);
  }

  drawText(ctx, `${current}/${max}`, x + total * (size + gap) + 18, y + 24, {
    size: 24,
    weight: "700"
  });
}

function getVisibleMembers(party) {
  const members = party.members || [];
  const slots = party.slots || 1;
  const lines = [];

  for (let i = 0; i < Math.min(3, slots); i++) {
    if (members[i]) {
      const member = members[i];
      const name = member.displayName || member.username || "Nieznany";
      lines.push(`${member.className || ""} ${name}`);
    } else {
      lines.push("Wolne miejsce");
    }
  }

  return lines;
}

async function createPartyPanel(party) {
  const canvas = createCanvas(theme.width, theme.height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx);

  ctx.fillStyle = party.closed ? "#94a3b8" : "#22c55e";
  ctx.fillRect(0, 0, 10, theme.height);

  drawText(ctx, `WYPRAWA: ${party.bossName}`, 45, 70, {
    size: 42,
    weight: "700"
  });

  drawText(ctx, party.closed ? "ZAMKNIETA" : "OTWARTA", 45, 120, {
    size: 28,
    weight: "700",
    color: party.closed ? "#cbd5e1" : "#22c55e"
  });

  drawLine(ctx, 45, 155, 650, 155);

  drawText(ctx, "POZIOM", 45, 205, {
    size: 23,
    weight: "700",
    color: "#e5e7eb"
  });
  drawText(ctx, String(party.level || "?"), 45, 240, { size: 26 });

  drawText(ctx, "START", 220, 205, {
    size: 23,
    weight: "700",
    color: "#e5e7eb"
  });
  drawText(ctx, party.time || "?", 220, 240, { size: 26 });

  drawText(ctx, "MAPA", 45, 285, {
    size: 23,
    weight: "700",
    color: "#e5e7eb"
  });
  drawText(ctx, party.map || "Nieznana", 45, 320, { size: 22 });

  drawLine(ctx, 45, 350, 650, 350);

  drawText(ctx, "ORGANIZATOR", 45, 395, {
    size: 23,
    weight: "700"
  });

  drawText(
    ctx,
    party.owner?.displayName || party.owner?.username || "Nieznany",
    45,
    430,
    {
      size: 24,
      color: "#93c5fd"
    }
  );

  drawLine(ctx, 45, 470, 650, 470);

  const members = party.members || [];
  const slots = party.slots || 1;

  drawText(ctx, "DRUZYNA", 45, 520, {
    size: 24,
    weight: "700"
  });

  drawProgress(ctx, 45, 545, members.length, slots);

  const visibleLines = getVisibleMembers(party);

  visibleLines.forEach((line, index) => {
    drawText(ctx, line, 45, 615 + index * 38, {
      size: 24,
      color: line === "Wolne miejsce" ? "#cbd5e1" : "#ffffff"
    });
  });

  const hidden = Math.max(0, slots - 3);

  if (hidden > 0) {
    drawText(ctx, `+${hidden} wiecej`, 360, 690, {
      size: 24,
      color: "#cbd5e1"
    });
  }

  drawLine(ctx, 45, 715, 650, 715);

  drawText(ctx, "OPIS", 45, 750, {
    size: 22,
    weight: "700"
  });

  drawText(ctx, party.description || "Brak opisu", 120, 750, {
    size: 22,
    color: "#e5e7eb"
  });

  if (party.imageFile) {
    const cardX = 655;
    const cardY = 90;
    const cardW = 420;
    const cardH = 420;

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(cardX + 10, cardY + 10, cardW, cardH);

    const bossGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    bossGradient.addColorStop(0, "#1e293b");
    bossGradient.addColorStop(1, "#020617");

    ctx.fillStyle = bossGradient;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    const imagePath = path.join(__dirname, "..", "assets", "bosses", party.imageFile);
    const bossImage = await loadImage(imagePath);

    ctx.imageSmoothingEnabled = false;

   const size = 320;

      const imageX = cardX + (cardW - size) / 2;
       const imageY = cardY + (cardH - size) / 2 + 10;

    ctx.drawImage(bossImage, imageX, imageY, size, size);

    ctx.imageSmoothingEnabled = true;
  }

  const buffer = canvas.toBuffer("image/png");

  return new AttachmentBuilder(buffer, {
    name: "party-panel.png"
  });
}

module.exports = createPartyPanel;