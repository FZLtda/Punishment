const configMenu = require('../interactions/configMenu');
const prefixModal = require('../interactions/prefixModal');

module.exports = async (interaction, client) => {
  await configMenu(interaction, client);
  await prefixModal(interaction, client);
};
