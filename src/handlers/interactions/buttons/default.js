const handleGiveawayButtons = require('./giveawayButtons');
    // Mais em breve...

module.exports = async function handleButton(interaction, client) {
  try {
    // !Se for botão de sorteio
    if (['participar', 'ver_participantes'].includes(interaction.customId)) {
      return await handleGiveawayButtons(interaction, client);
    }

    // Mais em breve...
    // Caso não tratado
    return interaction.reply({
      content: 'Este botão não está configurado.',
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
