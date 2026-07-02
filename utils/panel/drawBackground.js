const theme = require("./theme");

function drawBackground(ctx) {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        theme.width,
        theme.height
    );

    gradient.addColorStop(0, theme.colors.backgroundTop);
    gradient.addColorStop(1, theme.colors.backgroundBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, theme.width, theme.height);

    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 3;

    ctx.strokeRect(
        1.5,
        1.5,
        theme.width - 3,
        theme.height - 3
    );

}

module.exports = drawBackground;