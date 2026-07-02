async function drawAvatar(ctx, avatar, x, y, size, borderColor = "#a855f7") {
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  ctx.save();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, x, y, size, size);

  ctx.restore();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
}

module.exports = drawAvatar;