module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
      if (interaction.isButton() && interaction.customId === 'accept_terms') {
        const command = client.commands.get('acceptTerms');
        if (command) {
          await command.execute(interaction);
        }
      }
    },
  };
  