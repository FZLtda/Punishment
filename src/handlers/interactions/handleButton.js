const handleGiveawayButtons = require('@buttons/handleGiveawayButtons');
const handleTermsButtons = require('@buttons/handleTermsButtons');
const handleVerifyButtons = require('@buttons/handleVerifyButtons');
const logger = require('@utils/logger');

module.exports = async function handleButton(interaction, client) {
  try {
    const { customId } = interaction;

    if (['participar', 'ver_participantes'].includes(customId)) {
      return await handleGiveawayButtons(interaction, client);
    }

    if (customId === 'accept_terms') {
      return await handleTermsButtons(interaction, client);
    }

    if (customId === 'verify_user') {
      return await handleVerifyButtons(interaction, client);
    }

    return interaction.reply({
      content: 'Este botão não possui funcionalidade atribuída no momento.',
      ephemeral: true,
    });

  } catch (error) {
    logger.error(`Erro no handler de botões: ${error.message}`, {
      customId: interaction?.customId,
      user: interaction?.user?.tag,
      userId: interaction?.user?.id,
      stack: error.stack
    });

    return interaction.reply({
      content: '❌ Não foi possível processar esse botão.',
      ephemeral: true,
    });
  }
};
