const db = require("./commandsDatabase.js");

module.exports = async (message, prefix) => {
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const commandData = db.prepare("SELECT * FROM commands WHERE name = ?").get(commandName);
  if (!commandData) return;

  try {
    const func = new Function("message", "args", `"use strict"; (async () => { ${commandData.code} })();`);
    await func(message, args);
  } catch (err) {
    message.reply("Erro ao executar o comando.");
    console.error(err);
  }
};
