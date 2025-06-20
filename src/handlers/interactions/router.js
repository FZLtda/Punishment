const handleButtonInteraction = require('./buttons/default');
const commandHandlers = require('./commands/default');

module.exports = async function routeInteraction(interaction, client, type) {
  switch (type) {
    case 'button':
      return await handleButtonInteraction(interaction, client);

    case 'command':
      return await commandHandlers(interaction, client);

    default:
      throw new Error(`Tipo de interação não roteável: ${type}`);
  }
};
