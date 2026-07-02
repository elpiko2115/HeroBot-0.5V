const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function createButtons(party) {
  const isFull = party.members.length >= party.slots;

  if (party.closed) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("join")
        .setLabel("Dołącz")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("leave")
        .setLabel("Opuść")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("close")
        .setLabel("Zamknij")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("loot_roll")
        .setLabel("Losuj loot")
        .setEmoji("🎲")
        .setStyle(ButtonStyle.Primary)
    );
  }

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Dołącz")
      .setStyle(ButtonStyle.Success)
      .setDisabled(isFull),

    new ButtonBuilder()
      .setCustomId("leave")
      .setLabel("Opuść")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("close")
      .setLabel("Zamknij")
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = createButtons;