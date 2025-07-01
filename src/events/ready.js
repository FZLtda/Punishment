const { setBotPresence } = require('@bot/presence');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    await setBotPresence(client);
    console.log(`Punishment online como ${client.user.tag}`);
  }
};
