'use strict';

const Logger = require('@logger');

const ROTATION_INTERVAL = 15000;

const ACTIVITIES = [
  { name: '/help • Translate smarter with DeepL', type: 0 },
  { name: 'Code with ❤️ by FuncZero • Full-Stack Dev', type: 3 },
  { name: 'Support the project’s growth — .doar', type: 0 },
];

let activityIndex = 0;
let rotationInterval = null;

/**
 * Atualiza a activity atual do Punishment.
 */
async function updatePresence(client) {
  if (!client?.user || !client.isReady()) return;

  const activity = ACTIVITIES[activityIndex];

  try {
    await client.user.setPresence({
      status: 'dnd',
      activities: [activity],
    });

    Logger.debug(`[Presence] Activity aplicada: ${activity.name}`);
  } catch (error) {
    Logger.error(`[Presence] Falha ao aplicar activity: ${error.message}`);
  }

  activityIndex = (activityIndex + 1) % ACTIVITIES.length;
}

/**
 * Inicia a rotação de presença.
 */
function startPresenceRotation(client) {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }

  Logger.debug('[Presence] Iniciando sistema de rotação.');

  updatePresence(client);

  rotationInterval = setInterval(() => {
    updatePresence(client);
  }, ROTATION_INTERVAL);
}

/**
 * Para a rotação de presença.
 */
function stopPresenceRotation() {
  if (!rotationInterval) return;

  clearInterval(rotationInterval);
  rotationInterval = null;

  Logger.warn('[Presence] Rotação de presença finalizada.');
}

/**
 * Controlador principal de presença do bot.
 * @param {import('discord.js').Client} client
 * @param {string} [contexto='manual']
 */
async function setBotPresence(client, contexto = 'manual') {
  if (!client?.user || !client.isReady()) {
    Logger.debug(`[Presence] Ignorado: cliente não pronto (contexto: ${contexto})`);
    return;
  }

  try {
    startPresenceRotation(client);
    Logger.info(`[Presence] Sistema iniciado com sucesso. Contexto: ${contexto}`);
  } catch (error) {
    Logger.error(`[Presence] Erro crítico ao iniciar presença (${contexto}): ${error.message}`);
  }
}

module.exports = {
  setBotPresence,
  startPresenceRotation,
  stopPresenceRotation,
};
