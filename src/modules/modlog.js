"use strict";

const {
  EmbedBuilder,
  ChannelType,
  TextChannel,
  User,
  GuildMember,
  PermissionsBitField
} = require("discord.js");

const { GuildSettings } = require("@models");
const { colors, bot, emojis } = require("@config");
const Logger = require("@logger");

function resolveTargetLines(target) {
  if (!target) return [];

  if (target instanceof User) {
    return [`**Usuário:** ${target.tag} (\`${target.id}\`)`];
  }

  if (target instanceof GuildMember) {
    return [`**Usuário:** ${target.user.tag} (\`${target.user.id}\`)`];
  }

  if (typeof target.imageURL === "function" && target.id) {
    return [`**Nome:** ${target.name}`, `**ID:** ${target.id}`];
  }

  if (typeof target === "object" && target.id) {
    return [`**ID:** ${target.id}`];
  }

  return [];
}

function formatSafeLine(label, value) {
  if (!value) return null;
  let strValue = String(value);

  const backtickCount = (strValue.match(/```/g) || []).length;
  if (backtickCount % 2 !== 0) {
    strValue += "\n```";
  }

  if (strValue.includes("```") || strValue.includes("\n")) {
    return `**${label}:**\n${strValue}`;
  }

  return `**${label}:** ${strValue}`;
}

function buildEmbedDescription({
  action,
  target,
  moderator,
  reason,
  channel,
  extraFields
}) {
  const lines = [
    moderator?.tag && moderator?.id ? `**Moderador:** ${moderator.tag} (\`${moderator.id}\`)` : null,
    ...resolveTargetLines(target),
    reason ? formatSafeLine("Motivo", reason) : null,
    channel ? `**Canal:** ${channel}` : null,
    ...(Array.isArray(extraFields)
      ? extraFields.map(f => (f?.name && f?.value ? formatSafeLine(f.name, f.value) : null))
      : []),
    action ? `**Ação:** ${String(action).toLowerCase()}` : null
  ];

  return lines.filter(Boolean).join("\n");
}

async function sendModLog(guild, options) {
  if (!guild?.id || !guild?.client) {
    return Logger.warn("[MODLOG][unknown] Guild inválida ou ausente.");
  }

  const context = `[MODLOG][${guild.id}]`;

  const {
    action,
    target = null,
    moderator = null,
    reason = "Não especificado.",
    channel = null,
    extraFields = []
  } = options;

  if (!action) {
    return Logger.warn(`${context} Tentativa de enviar log sem ação definida.`);
  }

  try {
    const config = await GuildSettings.findOne({ guildId: guild.id }).lean();
    if (!config?.logChannelId) {
      return Logger.warn(`${context} Canal de logs não configurado no banco.`);
    }
    
    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!(logChannel instanceof TextChannel) || logChannel.type !== ChannelType.GuildText) {
      return Logger.warn(`${context} Canal de logs inválido ou não encontrado.`);
    }
    
    const botPermissions = logChannel.permissionsFor(guild.client.user);
    const requiredPerms = [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.EmbedLinks
    ];

    if (!botPermissions?.has(requiredPerms)) {
      return Logger.warn(`${context} Permissões insuficientes (View, Send ou Embed) no canal ${logChannel.name}.`);
    }
    
    const embed = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: "Registro de Moderação",
        iconURL: emojis.logs
      })
      .setDescription(
        buildEmbedDescription({
          action,
          target,
          moderator,
          reason,
          channel,
          extraFields
        })
      )
      .setTimestamp()
      .setFooter({
        text: bot.name,
        iconURL: guild.client.user.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });
    Logger.info(`${context} Log enviado: ${action}`);

  } catch (error) {
    Logger.error(`${context} Falha crítica ao enviar log: ${error.stack || error.message}`);
  }
}

module.exports = { sendModLog };
