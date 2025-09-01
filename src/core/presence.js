'use strict';

/**
 * Define a presença do bot (status e atividade personalizada).
 * @param {import('discord.js').Client} client - Instância do cliente Discord.
 */
async function setBotPresence(client) {
  if (!client || !client.user) {
    console.warn('[Presence] Cliente inválido ao tentar definir presença.');
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

    console.log(`[Presence] Presença definida como "Jogando /help" (status: DND).`);
  } catch (error) {
    console.error('[Presence] Falha ao definir presença:', error);
  }
}

module.exports = { setBotPresence };
