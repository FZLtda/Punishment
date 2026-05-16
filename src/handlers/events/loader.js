"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require("@logger");

async function getEventFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getEventFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[loadEvents] Falha ao ler diretório ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[loadEvents] Falha ao requerer ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadEvents(client) {
  if (!client) {
    Logger.error("[loadEvents] Client não fornecido.");
    return;
  }

  const start = Date.now();
  const eventsPath = path.join(__dirname, "../../../src/events");

  const files = await getEventFiles(eventsPath);

  if (!files || files.length === 0) {
    Logger.warn("[loadEvents] Nenhum evento encontrado.");
    return;
  }

  let registered = 0;
  let skipped = 0;

  for (const filePath of files) {
    try {
      const raw = safeRequire(filePath);
      if (!raw) {
        skipped++;
        continue;
      }

      const event = raw?.default ?? raw;

      if (!event?.name || typeof event?.execute !== "function") {
        Logger.warn(`[loadEvents] Evento inválido em: ${path.basename(filePath)}`);
        skipped++;
        continue;
      }

      const handler = (...args) => {
        try {
          return event.execute(...args, client);
        } catch (err) {
          Logger.error(`[loadEvents] Erro ao executar handler do evento ${event.name}:`, err);
        }
      };

      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }

      Logger.info(`[loadEvents] Evento registrado: ${event.name}`);
      registered++;
    } catch (err) {
      Logger.error(`[loadEvents] Falha ao processar ${path.basename(filePath)}:`, err);
      skipped++;
    }
  }

  const duration = Date.now() - start;
  Logger.info(`[loadEvents] Concluído: ${registered} registrados | ${skipped} ignorados | ${duration}ms`);
}

module.exports = {
  loadEvents
};
