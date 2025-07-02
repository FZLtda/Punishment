const { setBotPresence } = require('@bot/presence');
const Logger = require('@logger');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    try {
      await setBotPresence(client);
      Logger.info(`Punishment online como ${client.user.tag}`);
    } catch (err) {
      Logger.fatal(`Falha ao configurar presença ou concluir inicialização: ${err.stack || err.message}`);
    }
  }
};
