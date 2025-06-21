const handleButtonInteraction = require('@buttons/defaut');
const commandHandlers = require('@interactions/defaut');

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
