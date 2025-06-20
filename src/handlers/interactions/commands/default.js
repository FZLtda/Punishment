const { handleSlashCommand } = require('../../../slashCommandHandler');
const logger = require('../../../utils/logger');
const { attent } = require('../../../config/emoji.json');

module.exports = async function handleCommand(interaction, client) {
  try {

    // !Executa o comando de slash propriamente dito
    await handleSlashCommand(interaction, client);

  } catch (error) {
    logger.error(`Erro ao executar comando ${interaction.commandName}: ${error.message}`, {
      stack: error.stack,
      user: interaction.user.tag,
      userId: interaction.user.id,
      command: interaction.commandName,
    });

    // !Responde ao usuário com uma mensagem elegante e segura
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `${attent} Não foi possível executar este comando.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `${attent} Não foi possível executar este comando.`,
        ephemeral: true,
      });
    }
  }
};
