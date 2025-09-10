'use strict';

const Logger = require('@logger');

/**
 * Define a presença do bot (status e atividade personalizada).
 * @param {import('discord.js').Client} client - Instância do cliente Discord.
 * @param {string} [contexto='manual'] - Contexto de chamada (ex: ready, shardResume).
 */
async function setBotPresence(client, contexto = 'manual') {
  if (!client?.user || !client.isReady()) {
    Logger.debug(`[Presence] Ignorado: cliente não está pronto (contexto: ${contexto})`);
    return;
  }

  try {
    await client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: '/help • Translate smarter with DeepL',
          type: 0
        }
      ]
    });

    Logger.info(`[Presence] Presença definida com sucesso (status: DND). Contexto: ${contexto}`);
  } catch (error) {
    Logger.error(`[Presence] Falha ao definir presença (contexto: ${contexto}): ${error.message}`);
  }
}

module.exports = { setBotPresence };
