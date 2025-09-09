'use strict';

const Logger = require('@logger');

/**
 * Define a presença do bot (status e atividade personalizada).
 * @param {import('discord.js').Client} client - Instância do cliente Discord.
 * @param {string} [contexto='manual'] - Contexto de chamada (ex: ready, shardResume, interval).
 * @param {number} [tentativas=0] - Contador de tentativas.
 */
async function setBotPresence(client, contexto = 'manual', tentativas = 0) {
  if (!client || !client.user) {
    if (tentativas < 5) {
      Logger.warn(`[Presence] Cliente inválido ao tentar definir presença. Contexto: ${contexto}. Tentativa: ${tentativas + 1}`);
      setTimeout(() => setBotPresence(client, contexto, tentativas + 1), 5000);
    } else {
      Logger.error(`[Presence] Não foi possível definir presença após ${tentativas} tentativas. Contexto: ${contexto}`);
    }
    return;
  }

  if (client.ws.status !== 0) {
    Logger.warn(`[Presence] Conexão não está READY. Status: ${client.ws.status}. Contexto: ${contexto}`);
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
