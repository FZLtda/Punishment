"use strict";

const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");
const Logger = require("@logger");

async function getSlashFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getSlashFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[loadSlashCommands] Failed reading directory ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[loadSlashCommands] Failed to require ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadSlashCommands(client) {
  if (!client) {
    Logger.error("[loadSlashCommands] Client not provided.");
    return;
  }

  const commandsPath = path.join(__dirname, "../../../src/commands/slash");

  if (!fsSync.existsSync(commandsPath)) {
    Logger.warn(`[loadSlashCommands] Folder not found: ${commandsPath}`);
    return;
  }

  const start = Date.now();
  const files = await getSlashFiles(commandsPath);

  if (!files || files.length === 0) {
    Logger.warn("[loadSlashCommands] No slash command files found.");
    return;
  }

  if (!client.slashCommands) client.slashCommands = new Map();

  const slashCommandsPayload = [];
  let loaded = 0;
  let skipped = 0;

  for (const filePath of files) {
    try {
      const raw = safeRequire(filePath);
      if (!raw) {
        skipped++;
        continue;
      }

      const command = raw?.default ?? raw;

      if (!command?.data || typeof command.execute !== "function") {
        Logger.warn(`[loadSlashCommands] Invalid slash command ignored: ${path.basename(filePath)}`);
        skipped++;
        continue;
      }

      if (typeof command.data.toJSON !== "function") {
        Logger.warn(`[loadSlashCommands] Command data missing toJSON: ${command.data.name ?? path.basename(filePath)}`);
        skipped++;
        continue;
      }

      client.slashCommands.set(command.data.name, command);
      slashCommandsPayload.push(command.data.toJSON());
      Logger.info(`[loadSlashCommands] Slash loaded: /${command.data.name}`);
      loaded++;
    } catch (err) {
      Logger.error(`[loadSlashCommands] Failed processing ${path.basename(filePath)}:`, err);
      skipped++;
    }
  }

  const duration = Date.now() - start;
  Logger.info(`[loadSlashCommands] Discovery complete: ${loaded} loaded | ${skipped} skipped | ${duration}ms`);

  if (!slashCommandsPayload.length) {
    Logger.warn("[loadSlashCommands] No slash commands to deploy. Aborting deploy.");
    return;
  }

  client.once("ready", async () => {
    if (!process.env.TOKEN) {
      Logger.error("[loadSlashCommands] Missing TOKEN environment variable. Deploy aborted.");
      return;
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    const isGlobal = process.env.COMMAND_SCOPE === "global";
    const route = isGlobal
      ? Routes.applicationCommands(client.user.id)
      : Routes.applicationGuildCommands(client.user.id, process.env.TEST_GUILD_ID);

    try {
      Logger.info(`[loadSlashCommands] Deploying slash commands to ${isGlobal ? "GLOBAL" : "GUILD"} scope...`);
      await rest.put(route, { body: slashCommandsPayload });
      Logger.info("[loadSlashCommands] Slash commands registered successfully.");
    } catch (err) {
      Logger.error("[loadSlashCommands] Failed to register slash commands:", err);
    }
  });
}

module.exports = {
  loadSlashCommands
};
