const partyManager = require("./partyManager");
const createPartyEmbed = require("./createPartyEmbed");
const createButtons = require("./createButtons");

const CHECK_INTERVAL = 60 * 1000;
const REMINDER_BEFORE = 10 * 60 * 1000;

async function editPartyMessage(client, party) {
  if (!party.channelId || !party.messageId) return;

  const channel = await client.channels.fetch(party.channelId);
  const message = await channel.messages.fetch(party.messageId);

  const { embed, files } = createPartyEmbed(party);

  await message.edit({
    embeds: [embed],
    files,
    components: [createButtons(party)]
  });
}

function startScheduler(client) {
  console.log("⏰ Scheduler uruchomiony");

  setInterval(async () => {
    const activeParties = partyManager.getActiveParties();
    const now = Date.now();

    for (const party of activeParties) {
      if (!party.startAt) continue;

      const timeLeft = party.startAt - now;

      if (!party.reminded && timeLeft > 0 && timeLeft <= REMINDER_BEFORE) {
        try {
          const channel = await client.channels.fetch(party.channelId);

          await channel.send({
            content: `🔔 Wyprawa na **${party.bossName}** zaczyna się za mniej niż 10 minut!`
          });

          partyManager.markReminded(party.messageId);
        } catch (error) {
          console.error("Błąd przypomnienia:", error);
        }
      }

      if (timeLeft <= 0) {
        const result = partyManager.closeParty(party.messageId);
        if (!result.ok) continue;

        try {
          await editPartyMessage(client, result.party);
          console.log(`🔒 Automatycznie zamknięto wyprawę: ${result.party.bossName}`);
        } catch (error) {
          console.error("Błąd automatycznego zamykania:", error);
        }
      }
    }
  }, CHECK_INTERVAL);
}

module.exports = startScheduler;