const db = require(__dirname + "/data/commandsDatabase.js");

module.exports = {
  name: "cmd",
  description: "Gerencia comandos customizados.",
  async execute(message, args, prefix) {
    const subcommand = args[0];
    const name = args[1];
    const code = args.slice(2).join(" ");

    if (!subcommand) return message.reply(`Uso: \`${prefix}cmd <adicionar|editar|remover> <nome> <código>\``);

    if (subcommand === "adicionar") {
      if (!name || !code) return message.reply("Você precisa especificar o nome e o código do comando.");

      const exists = db.prepare("SELECT * FROM commands WHERE name = ?").get(name);
      if (exists) return message.reply("Esse comando já existe!");

      db.prepare("INSERT INTO commands (name, code) VALUES (?, ?)").run(name, code);
      return message.reply(`Comando \`${name}\` adicionado com sucesso!`);
    }

    if (subcommand === "editar") {
      if (!name || !code) return message.reply("Você precisa especificar o nome e o novo código do comando.");

      const exists = db.prepare("SELECT * FROM commands WHERE name = ?").get(name);
      if (!exists) return message.reply("Esse comando não existe!");

      db.prepare("UPDATE commands SET code = ? WHERE name = ?").run(code, name);
      return message.reply(`Comando \`${name}\` atualizado!`);
    }

    if (subcommand === "remover") {
      if (!name) return message.reply("Você precisa especificar o nome do comando.");

      const exists = db.prepare("SELECT * FROM commands WHERE name = ?").get(name);
      if (!exists) return message.reply("Esse comando não existe!");

      db.prepare("DELETE FROM commands WHERE name = ?").run(name);
      return message.reply(`Comando \`${name}\` removido!`);
    }
  }
};
