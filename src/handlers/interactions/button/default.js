const { handleButtonInteraction } = require('../../buttonHandler');

module.exports = async function handleButton(interaction, client) {
  return await handleButtonInteraction(interaction, client);
};
