"use strict";

const fetch = require("node-fetch");
const os = require("os");

const ERROR_WEBHOOK = process.env.ERROR_WEBHOOK ?? null;
const NODE_ENV = process.env.NODE_ENV ?? "unknown";

const LIMITS = Object.freeze({
  DESCRIPTION: 2048,
  FIELD_VALUE: 1024,
  MESSAGE_SNIPPET: 4000,
});

async function sendToWebhook(level, message) {
  if (!ERROR_WEBHOOK) {
    console.warn("Webhook de erro não configurado. Envio ignorado.");
    return;
  }

  const normalizedLevel = typeof level === "string" ? level.toLowerCase() : "error";
  const isError = message instanceof Error;

  const errorName = isError ? message.name ?? "Error" : null;
  const errorMessage = isError ? String(message.message ?? "") : null;
  const stack = isError ? String(message.stack ?? errorMessage ?? "") : null;

  const safeMessage = isError ? stack : String(message ?? "");
  const description = wrapInCodeBlock(truncate(safeMessage, LIMITS.MESSAGE_SNIPPET));

  const fields = [
    { name: "Level", value: normalizedLevel.toUpperCase(), inline: true },
    { name: "Environment", value: NODE_ENV, inline: true },
    { name: "Host", value: os.hostname(), inline: true },
    { name: "PID", value: String(process.pid), inline: true },
    { name: "Uptime", value: formatUptime(process.uptime()), inline: true },
    { name: "Memory RSS", value: formatBytes(process.memoryUsage().rss), inline: true },
  ];

  if (isError) {
    fields.unshift(
      { name: "Error", value: truncate(errorName, LIMITS.FIELD_VALUE), inline: true },
      { name: "Message", value: truncate(errorMessage, LIMITS.FIELD_VALUE), inline: false }
    );
  }

  const embed = {
    embeds: [
      {
        title: `Punishment - ${normalizedLevel.toUpperCase()}`,
        color: normalizedLevel === "fatal" ? 0x8B0000 : 0xFF0000,
        description,
        timestamp: new Date().toISOString(),
        fields: fields.map(f => ({
          name: String(f.name),
          value: String(f.value),
          inline: Boolean(f.inline),
        })),
      },
    ],
  };

  try {
    await fetch(ERROR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed),
    });
    console.info("Log enviado ao Discord via webhook.");
  } catch (err) {
    console.error("Falha ao enviar log para o Discord:", err && err.stack ? err.stack : err);
  }
}

function truncate(text, max) {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

function wrapInCodeBlock(text) {
  const safe = String(text ?? "").replace(/```/g, "`\u200B``");
  return `\`\`\`\n${safe}\n\`\`\``;
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

module.exports = { sendToWebhook };
