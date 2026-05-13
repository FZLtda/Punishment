"use strict";

const Logger = require("@logger");

const { getPrefix } = require("@helpers/prefixManager");

const {
  checkTerms,
  checkGlobalBan,
  checkCooldown,
} = require("@middlewares");

const {
  checkUserPermissions,
  checkBotPermissions,
} = require("@permissions");

const {
  sendWarning,
} = require("@embeds");

async function resolvePrefix(client, guildId) {
  if (client.getPrefix) {
    return await client.getPrefix(guildId);
  }

  return await getPrefix(guildId);
}

function parseCommand(messageContent, prefix) {
  if (!messageContent.startsWith(prefix)) {
    return null;
  }

  if (messageContent[prefix.length] === " ") {
    return null;
  }

  const args = messageContent
    .slice(prefix.length)
    .trim()
    .split(/\s+/);

  const commandName = args.shift()?.toLowerCase();

  if (
    !commandName ||
    ["__proto__", "constructor", "prototype"].includes(commandName)
  ) {
    return null;
  }

  return {
    commandName,
    args,
  };
}

async function preExecutionPipeline({
  message,
  command,
  member,
  botMember,
}) {
  if (await checkGlobalBan(message)) {
    return false;
  }

  const accepted = await checkTerms({
    user: message.author,
    client: message.client,
    reply: (opts) => message.channel.send(opts),
  });

  if (!accepted) {
    Logger.info(
      `[TERMS] ${message.author.tag} não aceitou os termos.`,
    );

    return false;
  }

  const cooldownPassed = await checkCooldown({
    message,
    command,
  });

  if (!cooldownPassed) {
    return false;
  }

  if (command.userPermissions) {
    const hasPermission = await checkUserPermissions(
      member,
      message,
      command.userPermissions,
    );

    if (!hasPermission) {
      return false;
    }
  }

  if (command.botPermissions) {
    const hasPermission = await checkBotPermissions(
      botMember,
      message,
      command.botPermissions,
    );

    if (!hasPermission) {
      return false;
    }
  }

  return true;
}

module.exports = {
  name: "messageCreate",

  async execute(message) {
    try {
      if (!message.guild || message.author.bot) {
        return;
      }

      const prefix = await resolvePrefix(
        message.client,
        message.guild.id,
      );

      const parsed = parseCommand(
        message.content,
        prefix,
      );

      if (!parsed) {
        return;
      }

      const {
        commandName,
        args,
      } = parsed;

      const command =
        message.client.commands.get(commandName) ??
        message.client.commands.find((cmd) =>
          cmd.aliases?.includes(commandName),
        );

      if (!command) {
        return;
      }

      const member =
        message.member ??
        await message.guild.members.fetch(message.author.id);

      const botMember = message.guild.members.me;

      const canProceed = await preExecutionPipeline({
        message,
        command,
        member,
        botMember,
      });

      if (!canProceed) {
        return;
      }

      if (command.deleteMessage) {
        try {
          await message.delete();
        } catch (err) {
          Logger.warn(
            `[DELETE] Falha ao apagar msg de ${message.author.tag}: ${err.message}`,
          );
        }
      }

      Logger.info(
        `[COMMAND] ${message.author.tag} (${message.author.id}) ` +
        `usou ${prefix}${commandName} em ` +
        `#${message.channel.name} (${message.guild.name})`,
      );

      await command.execute(message, args);

    } catch (error) {
      Logger.error(
        `[ERROR][${message?.guild?.name ?? "Unknown"}] ` +
        `Falha ao executar comando`,
        error,
      );

      try {
        if (
          message?.channel &&
          message.client?.isReady()
        ) {
          await sendWarning(
            message,
            "Não foi possível executar o comando.",
          );
        }
      } catch (warnError) {
        Logger.warn(
          "[messageCreate] Falha ao enviar aviso de erro",
          warnError,
        );
      }
    }
  },
};
