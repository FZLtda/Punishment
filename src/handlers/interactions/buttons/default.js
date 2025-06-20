const handleGiveawayButtons = require('@buttons');
const handleTermsButtons = require('@buttons');
const handleVerifyButtons = require('@buttons');

module.exports = async function handleButton(interaction, client) {
  try {
    if (['participar', 'ver_participantes'].includes(interaction.customId)) {
      return await handleGiveawayButtons(interaction, client);
    }

    if (interaction.customId === 'accept_terms') {
      return await handleTermsButtons(interaction, client);
    }

    if (interaction.customId === 'verify_user') {
      return await handleVerifyButtons(interaction, client);
    }

    return interaction.reply({
      content: 'Este botão não possui funcionalidade atribuída no momento.',
      ephemeral: true,
    });
  } catch (error) {
    console.error(`Erro no handler de botões: ${error.message}`);
    return interaction.reply({
      content: 'Não foi possível processar esse botão.',
      ephemeral: true,
    });
  }
};
