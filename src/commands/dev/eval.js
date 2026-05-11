"use strict";

const util = require("node:util");

const { bot } = require("@config");
const { sendWarning } = require("@embeds/embedWarning");

module.exports = {
  name: "eval",
  description: "Executa códigos JavaScript diretamente pelo Discord.",
  usage: "${currentPrefix}eval <código>",
  aliases: ["e"],
  category: "dev",
  deleteMessage: true,

  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const code = args.join(" ");

    if (!code) {
      return sendWarning(
        message,
        "Você precisa fornecer um código para executar."
      );
    }

    try {
      let result = await eval(`
        (async () => {
          ${code}
        })()
      `);

      if (typeof result === "undefined") {
        return;
      }

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
          depth: 1,
          colors: false,
        });
      }

      if (result.length > 1900) {
        result = `${result.slice(0, 1900)}\n...`;
      }

      return message.channel.send({
        content: result,
      });

    } catch (error) {

      const formattedError = util.inspect(error, {
        depth: 1,
        colors: false,
      });

      return message.channel.send({
        content: [
          "```js",
          formattedError.slice(0, 1900),
          "```",
        ].join("\n"),
      });

    }
  },
};
