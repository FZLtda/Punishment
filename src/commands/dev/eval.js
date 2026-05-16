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
  /fs\./i,
];

const RAW_ERROR_IN_QUOTES = true;
const SANITIZE_ERRORS = true;

module.exports = {
  name: "eval",
  aliases: ["e"],
  category: "dev",
  deleteMessage: false,

  async execute(message, args, client) {
    try {
      if (!bot?.ownerId) {
        return message.channel.send("```js\nBot config inválida (ownerId não encontrado).\n```");
      }

      if (message.author.id !== bot.ownerId) return;

      const code = args.join(" ");
      if (!code) return message.channel.send("Código não fornecido.");

      if (BLOCKED.some((r) => r.test(code))) {
        return message.channel.send("```js\nCódigo bloqueado por segurança.\n```");
      }

      const start = process.hrtime.bigint();

      const sandbox = {
        client: Object.assign({}, client, { token: undefined }),
        message,
        channel: message.channel,
        guild: message.guild,
        member: message.member,
        author: message.author,
        args,
        console,

        require: () => {
          throw new Error("require() está bloqueado no eval.");
        },

        process: undefined,
        Buffer,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
      };

      const context = vm.createContext(sandbox);

      const script = new vm.Script(`
        (async () => {
          ${code}
        })()
      `);

      let result;

      try {
        result = await Promise.race([
          script.runInContext(context),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("Timeout (5s)")), 5000)
          ),
        ]);
      } catch (err) {
        const rawMsg = err && err.message ? String(err.message) : String(err);

        const token =
          process.env.DISCORD_TOKEN ||
          process.env.TOKEN ||
          bot?.token ||
          "";

        const sanitized =
          SANITIZE_ERRORS && token
            ? rawMsg.split(token).join("[TOKEN]")
            : rawMsg;

        const payload = RAW_ERROR_IN_QUOTES
          ? `"${sanitized}"`
          : sanitized;

        return message.channel.send("```js\n" + payload + "\n```");
      }

      const end = process.hrtime.bigint();
      const time = Number(end - start) / 1e6;

      if (typeof result !== "string") {
        try {
          result =
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result);
        } catch {
          result = util.inspect(result, { depth: 2 });
        }
      }

      if (typeof result === "string" && SANITIZE_ERRORS) {
        const token =
          process.env.DISCORD_TOKEN ||
          process.env.TOKEN ||
          bot?.token ||
          "";

        if (token) {
          result = result.split(token).join("[TOKEN]");
        }
      }

      if (result.length > 1900) {
        result = result.slice(0, 1900) + "...";
      }

      Logger.info(`[EVAL] ${message.author.tag} - ${time.toFixed(2)}ms`);

      const output = result;

      return message.channel.send(
        "```js\n" +
          output +
          `\n\n⏱ ${time.toFixed(2)}ms` +
          "\n```"
      );
    } catch (err) {
      Logger.error("[EVAL ERROR]", err);

      return message.channel.send("```js\nErro interno no eval.\n```");
    }
  },
};
