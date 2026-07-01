require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.execute) {
    console.log(`⚠️ Pomijam ${file} - brak data albo execute.`);
    continue;
  }
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Rejestruję ${commands.length} komend(y)...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Komendy zostały zarejestrowane!");
  } catch (error) {
    console.error(error);
  }
})();
