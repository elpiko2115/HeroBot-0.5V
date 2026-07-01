const roles = require("../data/roles.json");

const classEmojis = {
  "Wojownik": "⚔️",
  "Paladyn": "🛡️",
  "Mag": "🧙",
  "Tropiciel": "🏹",
  "Łowca": "🗡️",
  "Tancerz Ostrzy": "💃"
};

function detectClass(member) {
  for (const [className, roleId] of Object.entries(roles)) {
    if (!roleId) continue;

    if (member.roles.cache.has(roleId)) {
      return {
        className,
        classEmoji: classEmojis[className] || "❔"
      };
    }
  }

  return {
    className: "Brak klasy",
    classEmoji: "❔"
  };
}

module.exports = detectClass;