const { handleSlashCommand } = require('../../slashCommandHandler');

module.exports = async function handleCommand(interaction, client) {
  return await handleSlashCommand(interaction, client);
};
