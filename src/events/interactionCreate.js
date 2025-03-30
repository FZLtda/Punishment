module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`[ERROR] Erro ao executar Slash Command: ${error.message}`);
        await interaction.reply({
          content: '<:1000042883:1336044555354771638> Ocorreu um erro ao executar este comando.',
          ephemeral: true
        });
      }
    }

    if (interaction.isButton()) {
      handleButtonInteraction(interaction, client);
    }
  }
};

async function handleButtonInteraction(interaction, client) {
  try {
    const buttonHandlers = {
      'accept_terms': require('../interactions/buttons/acceptTerms'),
      'participar': require('../interactions/buttons/giveaway').participar,
      'ver_participantes': require('../interactions/buttons/giveaway').verParticipantes
    };

    const handler = buttonHandlers[interaction.customId];
    if (handler) {
      await handler(interaction, client);
    } else {
      interaction.reply({ content: 'Botão não reconhecido.', ephemeral: true });
    }
  } catch (error) {
    console.error(`[ERROR] Erro ao processar interação de botão: ${error.message}`);
  }
}



