/**
 * Define a presença do bot (status + atividade)
 * @param {import('discord.js').Client} client
 */
async function setBotPresence(client) {
  if (!client || !client.user) return;

  await client.user.setPresence({
    status: 'dnd',
    activities: [
      {
        name: '.doar',
        type: 0
      }
    ]
  });
}

module.exports = { setBotPresence };
