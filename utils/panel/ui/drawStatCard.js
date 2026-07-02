const drawRoundRect = require("./drawRoundRect");
const theme = require("./theme");

function drawStatCard(ctx, x, y, icon, title, value) {
    ctx.save();

    // Tło
    ctx.fillStyle = theme.card;
    drawRoundRect(ctx, x, y, 185, 88, 16);
    ctx.fill();

    // Cień
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 0;

    // Ramka
    ctx.strokeStyle = theme.borderSoft;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ikona
    ctx.drawImage(icon, x + 16, y + 16, 30, 30);

    // Tytuł
    ctx.fillStyle = theme.muted;
    ctx.font = "bold 18px Arial";
    ctx.fillText(title.toUpperCase(), x + 58, y + 36);

    // Wartość
    ctx.fillStyle = theme.text;
    ctx.font = "bold 32px Arial";
    ctx.fillText(String(value), x + 58, y + 70);

    ctx.restore();
}

module.exports = drawStatCard;