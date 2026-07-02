const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

function getBosses() {
  delete require.cache[require.resolve("../data/bosses.json")];
  return require("../data/bosses.json");
}

const partyManager = require("../utils/partyManager");
const createPartyPanel = require("../utils/createPartyPanel");
const detectClass = require("../utils/detectClass");
const createButtons = require("../utils/createButtons");
const parseStartTime = require("../utils/timeParser");
const lootManager = require("../utils/lootManager");
const historyManager = require("../utils/historyManager");
const { updatePartyDashboard, updateLootDashboard } = require("../utils/dashboardManager");

const PARTY_CHANNEL_ID = "1521668086074445985";
const LOOT_CHANNEL_ID = process.env.LOOT_CHANNEL_ID || "1521958266748538927";
const PARTY_HISTORY_CHANNEL_ID = process.env.PARTY_HISTORY_CHANNEL_ID;

const categories = {
  e2: { title: "🟢 Wybierz Elitę II", category: "E2", color: 0x2ecc71 },
  heroes: { title: "🟡 Wybierz Herosa", category: "Hero", color: 0xf1c40f },
  titans: { title: "🔴 Wybierz Tytana", category: "Titan", color: 0xe74c3c },
  colossi: { title: "👑 Wybierz Kolosa", category: "Colossus", color: 0x9b59b6 }
};

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith("category_")) {
          const categoryKey = interaction.customId.replace("category_", "");
          const categoryData = categories[categoryKey];
          if (!categoryData) return;

          const bosses = getBosses();
          const categoryBosses = bosses.filter(
            boss => boss.category === categoryData.category
          );

          if (categoryBosses.length === 0) {
            await interaction.reply({
              content: "❌ Brak przeciwników w tej kategorii.",
              ephemeral: true
            });
            return;
          }

          const select = new StringSelectMenuBuilder()
            .setCustomId(`selectBoss_${categoryKey}`)
            .setPlaceholder("Wybierz przeciwnika")
            .addOptions(
              categoryBosses.slice(0, 25).map(boss => ({
                label: boss.name,
                description: `Poziom: ${boss.level} | Mapa: ${boss.map || "Nieznana"}`,
                value: boss.name,
                emoji: boss.emoji || "🎯"
              }))
            );

          const embed = new EmbedBuilder()
            .setColor(categoryData.color)
            .setTitle(categoryData.title)
            .setDescription(`📖 Dostępnych: **${categoryBosses.length}**\n\nWybierz przeciwnika z listy poniżej.`);

          const selectRow = new ActionRowBuilder().addComponents(select);

          const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("back_categories")
              .setLabel("Powrót")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.update({
            embeds: [embed],
            components: [selectRow, backRow]
          });

          return;
        }

        if (interaction.customId === "back_categories") {
          const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🎯 Wybierz kategorię")
            .setDescription("Wybierz typ przeciwnika, na którego chcesz zorganizować wyprawę.");

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("category_e2").setLabel("Elita II").setEmoji("🟢").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("category_heroes").setLabel("Herosi").setEmoji("🟡").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("category_titans").setLabel("Tytani").setEmoji("🔴").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("category_colossi").setLabel("Kolosi").setEmoji("👑").setStyle(ButtonStyle.Secondary)
          );

          await interaction.update({
            embeds: [embed],
            components: [row]
          });

          return;
        }

        if (interaction.customId === "loot_roll") {
          const messageId = interaction.message.id;
          const party = partyManager.getParty(messageId);

          if (!party) {
            await interaction.reply({
              content: "❌ Nie znaleziono danych tej wyprawy.",
              ephemeral: true
            });
            return;
          }

          if (!party.closed) {
            await interaction.reply({
              content: "❌ Loot można losować dopiero po zamknięciu wyprawy.",
              ephemeral: true
            });
            return;
          }

          if (lootManager.hasLootResult(messageId)) {
            await interaction.reply({
              content: "❌ Loot dla tej wyprawy został już rozdany.",
              ephemeral: true
            });
            return;
          }

          if (interaction.user.id !== party.owner.id) {
            await interaction.reply({
              content: "❌ Tylko organizator może losować loot.",
              ephemeral: true
            });
            return;
          }

          const members = party.members || [];

          if (members.length === 0) {
            await interaction.reply({
              content: "❌ Brak uczestników do losowania.",
              ephemeral: true
            });
            return;
          }

          const winner = members[Math.floor(Math.random() * members.length)];
          const guildMember = await interaction.guild.members.fetch(winner.id).catch(() => null);

          const winnerName =
            guildMember?.displayName ||
            guildMember?.user?.username ||
            winner.displayName ||
            winner.username ||
            winner.id;

          lootManager.saveLootResult({
            messageId,
            bossName: party.bossName,
            winner: {
              ...winner,
              displayName: winnerName
            },
            ownerId: party.owner.id,
            members
          });

          await updateLootDashboard(interaction.client);


          await interaction.reply({
            content: `✅ Loot został wylosowany i zapisany na kanale <#${LOOT_CHANNEL_ID}>.`,
            ephemeral: true
          });

          return;
        }

        if (["join", "leave", "close"].includes(interaction.customId)) {
          const messageId = interaction.message.id;
          const party = partyManager.getParty(messageId);

          if (!party) {
            await interaction.reply({
              content: "❌ Nie znaleziono danych tej wyprawy. Możliwe, że bot został zrestartowany.",
              ephemeral: true
            });
            return;
          }

          if (interaction.customId === "join") {
            const detected = detectClass(interaction.member);

            const result = partyManager.joinParty(messageId, {
              id: interaction.user.id,
              username: interaction.user.username,
              displayName: interaction.member.displayName,
              className: detected.className,
              classEmoji: detected.classEmoji
            });

            if (!result.ok) {
              const messages = {
                closed: "❌ Rekrutacja jest zamknięta.",
                already_joined: "⚠️ Już jesteś zapisany na tę wyprawę.",
                full: "❌ Drużyna jest pełna."
              };

              await interaction.reply({
                content: messages[result.reason] || "❌ Nie udało się dołączyć.",
                ephemeral: true
              });
              return;
            }

            const panel = await createPartyPanel(result.party);

            await interaction.update({
              files: [panel],
              components: [createButtons(result.party)]
            });

            return;
          }

          if (interaction.customId === "leave") {
            if (interaction.user.id === party.owner.id) {
              await interaction.reply({
                content: "❌ Organizator nie może opuścić własnej wyprawy. Użyj przycisku Zamknij.",
                ephemeral: true
              });
              return;
            }

            const result = partyManager.leaveParty(messageId, interaction.user.id);
            const panel = await createPartyPanel(result.party);

            await interaction.update({
              files: [panel],
              components: [createButtons(result.party)]
            });

            return;
          }

          if (interaction.customId === "close") {
            if (interaction.user.id !== party.owner.id) {
              await interaction.reply({
                content: "❌ Tylko organizator może zamknąć wyprawę.",
                ephemeral: true
              });
              return;
            }

const result = partyManager.closeParty(messageId);

historyManager.savePartyHistory({
  ...result.party,
  messageId
});

await updatePartyDashboard(interaction.client);

const panel = await createPartyPanel(result.party);

            await interaction.update({
              files: [panel],
              components: [createButtons(result.party)]
            });

            return;
          }
        }
      }

      if (interaction.isStringSelectMenu()) {
        if (!interaction.customId.startsWith("selectBoss_")) return;

        const categoryKey = interaction.customId.replace("selectBoss_", "");
        const bossName = interaction.values[0];

        const modal = new ModalBuilder()
          .setCustomId(`party_${categoryKey}_${bossName}`)
          .setTitle(`Wyprawa - ${bossName}`);

        const timeInput = new TextInputBuilder()
          .setCustomId("time")
          .setLabel("Godzina (np. 21:30)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const slotsInput = new TextInputBuilder()
          .setCustomId("slots")
          .setLabel("Liczba miejsc")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const descriptionInput = new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Opis")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(timeInput),
          new ActionRowBuilder().addComponents(slotsInput),
          new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith("party_")) return;

        const parts = interaction.customId.split("_");
        const categoryKey = parts[1];
        const bossName = parts.slice(2).join("_");

        const categoryData = categories[categoryKey];
        const bosses = getBosses();

        const boss = bosses.find(
          item => item.name === bossName && item.category === categoryData.category
        );

        const time = interaction.fields.getTextInputValue("time");
        const slots = Number(interaction.fields.getTextInputValue("slots"));
        const description = interaction.fields.getTextInputValue("description") || "Brak opisu";

        if (!Number.isInteger(slots) || slots < 1 || slots > 50) {
          await interaction.reply({
            content: "❌ Liczba miejsc musi być liczbą od 1 do 50.",
            ephemeral: true
          });
          return;
        }

        const detected = detectClass(interaction.member);

        const partyData = {
          bossName,
          bossEmoji: boss?.emoji || "🎯",
          level: boss?.level || "?",
          map: boss?.map || "Nieznana",
          image: boss?.image || "",
          imageFile: boss?.imageFile || "",
          color: categoryData.color,
          owner: {
            id: interaction.user.id,
            username: interaction.user.username,
            displayName: interaction.member.displayName,
            className: detected.className,
            classEmoji: detected.classEmoji
          },
          time,
          startAt: parseStartTime(time),
          slots,
          description
        };

        const partyPreview = {
          ...partyData,
          members: [partyData.owner],
          closed: false
        };

        const channel = await interaction.client.channels.fetch(PARTY_CHANNEL_ID);

        const panel = await createPartyPanel(partyPreview);

        const message = await channel.send({
          files: [panel],
          components: [createButtons(partyPreview)]
        });

        partyManager.createParty(message.id, channel.id, partyData);

        await interaction.reply({
          content: "✅ Ogłoszenie zostało utworzone!",
          ephemeral: true
        });
      }
    } catch (error) {
      console.error(error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Wystąpił błąd podczas obsługi akcji.",
          ephemeral: true
        });
      }
    }
  }
};