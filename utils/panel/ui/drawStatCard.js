const drawRoundRect = require("./drawRoundRect");

function drawStatCard(ctx, x, y, icon, title, value) {
    ctx.save();

    // Tło
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    drawRoundRect(ctx, x, y, 185, 88, 16);
    ctx.fill();

    // Cień
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 0;

    // Ramka
    ctx.strokeStyle = "rgba(139,92,246,0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ikona
    ctx.drawImage(icon, x + 16, y + 16, 30, 30);

    // Tytuł
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 18px Arial";
    ctx.fillText(title.toUpperCase(), x + 58, y + 36);

    // Wartość
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 32px Arial";
    ctx.fillText(String(value), x + 58, y + 70);

    ctx.restore();
}

module.exports = drawStatCard;