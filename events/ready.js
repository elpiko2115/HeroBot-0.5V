const { Events } = require("discord.js");

const partyManager = require("../utils/partyManager");
const startScheduler = require("../utils/scheduler");
const syncBosses = require("../utils/syncBosses");

module.exports = {
  name: Events.ClientReady,
  once: true,

async execute(client) {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);
    console.log("🌍 Synchronizacja bossów...");

try {

    const result = await syncBosses();

    console.log(`✅ Synchronizacja zakończona (${result.total} bossów)`);

} catch (err) {

    console.error("❌ Synchronizacja nie powiodła się:");

    console.error(err);

}

    const activeParties = partyManager.getActiveParties();

    console.log("🔄 Recovery System");
    console.log(`✅ Odzyskano aktywne wyprawy: ${activeParties.length}`);

    startScheduler(client);
  },
};