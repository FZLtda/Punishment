"use strict";

const util = require("node:util");
const vm = require("node:vm");
const os = require("node:os");
const process = require("node:process");

const { EmbedBuilder, codeBlock } = require("discord.js");

const { bot } = require("@config");
const { sendWarning } = require("@embeds");
const Logger = require("@logger");

const SENSITIVE_PATTERNS = [
  /process\.env/gi,
  /token/gi,
  /client\.token/gi,
  /mongoose\.connection/gi,
  /fs\.rm/gi,
  /fs\.unlink/gi,
  /child_process/gi,
  /execSync/gi,
  /spawn/gi,
  /fork/gi,
  /while\s*\(\s*true\s*\)/gi,
];

module.exports = {
  name: "eval",
  description: "Executa códigos JavaScript diretamente pelo Discord.",
  usage: "${currentPrefix}eval <código>",
  aliases: ["e"],
  category: "dev",
  deleteMessage: false,

  async execute(message, args, client) {
    try {

      if (message.author.id !== bot.ownerId) {
        return;
      }

      const code = args.join(" ");

      if (!code) {
        return sendWarning(
          message,
          "Você precisa fornecer um código para executar."
        );
      }

      const matchedPattern = SENSITIVE_PATTERNS.find((pattern) =>
        pattern.test(code)
      );

      if (matchedPattern) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("🚫 Código bloqueado")
              .setDescription(
                [
                  "O código enviado contém padrões potencialmente perigosos.",
                  "",
                  `\`${matchedPattern}\``,
                ].join("\n")
              )
              .setTimestamp(),
          ],
        });
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

        bot,
      };

      const context = vm.createContext(sandbox);

      const wrappedCode = `
        (async () => {
          ${code}
        })()
      `;

      const script = new vm.Script(wrappedCode);

      let result = await Promise.race([
        script.runInContext(context),
        new Promise((_, reject) =>
          setTimeout(() => {
            reject(new Error("Tempo limite de execução excedido."));
          }, 5000)
        ),
      ]);

      const end = process.hrtime.bigint();
      const executionTime = Number(end - start) / 1e6;

      const isMessage =
        result &&
        typeof result === "object" &&
        "channelId" in result &&
        "author" in result &&
        "content" in result;

      if (isMessage) {
        return;
      }

      if (typeof result !== "string") {
        result = util.inspect(result, {
          depth: 2,
          colors: false,
          maxArrayLength: 20,
        });
      }

      if (client.token) {
        result = result.replaceAll(client.token, "[TOKEN REDACTED]");
      }

      if (process.env.DISCORD_TOKEN) {
        result = result.replaceAll(
          process.env.DISCORD_TOKEN,
          "[ENV TOKEN REDACTED]"
        );
      }

      if (result.length > 1900) {
        result = `${result.slice(0, 1900)}\n...`;
      }

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Eval Executado")
        .addFields(
          {
            name: "👤 Autor",
            value: `${message.author.tag} (${message.author.id})`,
          },
          {
            name: "⏱️ Tempo",
            value: `${executionTime.toFixed(2)}ms`,
            inline: true,
          },
          {
            name: "🖥️ Memória",
            value: `${(
              process.memoryUsage().heapUsed /
              1024 /
              1024
            ).toFixed(2)} MB`,
            inline: true,
          },
          {
            name: "📦 Resultado",
            value: codeBlock(
              "js",
              result || "Nenhum resultado retornado."
            ),
          }
        )
        .setFooter({
          text: os.hostname(),
        })
        .setTimestamp();

      await message.channel.send({
        embeds: [successEmbed],
      });

      Logger.info(
        `[EVAL] ${message.author.tag} executou um eval em ${executionTime.toFixed(
          2
        )}ms`
      );

    } catch (error) {

      let formattedError = util.inspect(error, {
        depth: 2,
        colors: false,
      });

      if (formattedError.length > 1900) {
        formattedError = `${formattedError.slice(0, 1900)}\n...`;
      }

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao executar eval")
        .setDescription(codeBlock("js", formattedError))
        .setTimestamp();

      await message.channel.send({
        embeds: [errorEmbed],
      });

      Logger.error(`[EVAL ERROR] ${formattedError}`);

    }
  },
};
