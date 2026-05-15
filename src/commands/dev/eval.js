"use strict";

const vm = require("node:vm");
const util = require("node:util");
const process = require("node:process");

const { bot } = require("@config");
const Logger = require("@logger");

const BLOCKED = [
  /process\.env/i,
  /token/i,
  /child_process/i,
  /execSync|spawn|fork/i,
  /while\s*\(\s*true\s*\)/i,
];

module.exports = {
  name: "eval",
  aliases: ["e"],
  category: "dev",
  deleteMessage: false,

  async execute(message, args, client) {
    if (message.author.id !== bot.ownerId) return;

    const code = args.join(" ");
    if (!code) return message.channel.send("Código não fornecido.");

    if (BLOCKED.some((r) => r.test(code))) {
      return message.channel.send("```js\nCódigo bloqueado.\n```");
    }

    const start = process.hrtime.bigint();

    const sandbox = {
      client,
      message,
      channel: message.channel,
      guild: message.guild,
      member: message.member,
      author: message.author,
      args,
      console,
      require,
      process,
      Buffer,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
    };

    const context = vm.createContext(sandbox);

    const script = new vm.Script(`
      (async () => { ${code} })()
    `);

    let result;

    try {
      result = await Promise.race([
        script.runInContext(context),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("Timeout")), 5000)
        ),
      ]);
    } catch (err) {
      return message.channel.send(`\`\`\`js\n${util.inspect(err)}\n\`\`\``);
    }

    const end = process.hrtime.bigint();
    const time = Number(end - start) / 1e6;

    if (typeof result !== "string") {
      result = util.inspect(result, { depth: 2 });
    }

    result = result
      .replaceAll(client.token ?? "", "[TOKEN]")
      .replaceAll(process.env.DISCORD_TOKEN ?? "", "[TOKEN]");

    if (result.length > 1900) result = result.slice(0, 1900) + "...";

    Logger.info(`[EVAL] ${message.author.tag} - ${time.toFixed(2)}ms`);

    return message.channel.send(
      "```js\n" +
        result +
        `\n\n⏱ ${time.toFixed(2)}ms` +
        "\n```"
    );
  },
};
