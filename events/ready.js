const { Events } = require("discord.js");

const partyManager = require("../utils/partyManager");
const startScheduler = require("../utils/scheduler");

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    const activeParties = partyManager.getActiveParties();

    console.log("🔄 Recovery System");
    console.log(`✅ Odzyskano aktywne wyprawy: ${activeParties.length}`);

    startScheduler(client);
  },
};