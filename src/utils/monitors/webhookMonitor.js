"use strict";

const { 
  WebhookClient, 
  EmbedBuilder 
} = require("discord.js");
const os = require("os");
const { colors, bot } = require("@config");
const Logger = require("@logger");

const MONITOR_WEBHOOK_URL = process.env.MONITOR_WEBHOOK_URL ?? null;
const NODE_ENV = process.env.NODE_ENV ?? "unknown";

const TYPES = Object.freeze({
  INFO: "info",
  ERROR: "error",
});

const LIMITS = Object.freeze({
  DESCRIPTION: 2048,
  FIELD_VALUE: 1024,
  STACK_SNIPPET: 1900,
});

async function reportErrorToWebhook(title, content, type = TYPES.ERROR) {
  if (!MONITOR_WEBHOOK_URL) {
    Logger.warn("Webhook de monitoramento não configurado. Envio remoto ignorado.");
    return;
  }

  const normalizedType = ["info", "error"].includes(String(type).toLowerCase())
    ? String(type).toLowerCase()
    : TYPES.ERROR;

  const isError = content instanceof Error;
  const errorName = isError ? content.name ?? "Error" : null;
  const errorMessage = isError ? String(content.message ?? "") : null;
  const stack = isError ? String(content.stack ?? errorMessage ?? "") : null;

  const safeTitle = String(title ?? "Notificação");
  const safeContentString = isError ? errorMessage : String(content ?? "");

  const description = isError
    ? wrapInCodeBlock(truncate(stack, LIMITS.STACK_SNIPPET))
    : truncate(safeContentString, LIMITS.DESCRIPTION);

  const fields = [
    { name: "Tipo", value: normalizedType, inline: true },
    { name: "Ambiente", value: NODE_ENV, inline: true },
    { name: "Host", value: os.hostname(), inline: true },
    { name: "PID", value: String(process.pid), inline: true },
    { name: "Uptime", value: formatUptime(process.uptime()), inline: true },
    { name: "Memória RSS", value: formatBytes(process.memoryUsage().rss), inline: true },
  ];

  if (isError) {
    fields.unshift(
      { name: "Erro", value: truncate(errorName, LIMITS.FIELD_VALUE), inline: true },
      { name: "Mensagem", value: truncate(errorMessage, LIMITS.FIELD_VALUE), inline: false }
    );
  }

  const embed = new EmbedBuilder()
    .setTitle(safeTitle)
    .setDescription(description)
    .setColor(normalizedType === TYPES.INFO ? colors.green : colors.red)
    .setTimestamp()
    .setFooter({ text: bot.name, iconURL: bot.logo })
    .addFields(
      fields.map(f => ({ name: String(f.name), value: String(f.value), inline: Boolean(f.inline) }))
    );

  let webhook;
  try {
    webhook = new WebhookClient({ url: MONITOR_WEBHOOK_URL });

    await webhook.send({
      username: bot.name,
      avatarURL: bot.logo,
      embeds: [embed],
    });

    Logger.info("Notificação enviada via webhook.");
  } catch (err) {
    Logger.error("Falha ao enviar notificação ao webhook.", err && err.stack ? err.stack : err);
  } finally {
    try {
      if (webhook && typeof webhook.destroy === "function") {
        webhook.destroy();
      }
    } catch (destroyErr) {
      Logger.debug("Falha ao destruir WebhookClient:", destroyErr && destroyErr.stack ? destroyErr.stack : destroyErr);
    }
  }
}

function truncate(text, max) {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

function wrapInCodeBlock(text) {
  const safe = String(text ?? "").replace(/```/g, "`\u200B``");
  return `\`\`\`js\n${safe}\n\`\`\``;
}

function formatUptime(seconds) {
  const s = Math.floor(Number(seconds) || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

function formatBytes(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  let value = b;
  do {
    value = value / 1024;
    i++;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(2)} ${units[i]}`;
}

module.exports = { reportErrorToWebhook };
