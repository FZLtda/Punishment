module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    try {
      // 🔹 Slash Command
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({ content: 'Comando não encontrado.', ephemeral: true });
        }
        await command.execute(interaction, client);
      }

      // 🔹 Botão
      else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (!button) {
          return interaction.reply({ content: 'Botão não reconhecido.', ephemeral: true });
        }
        await button.execute(interaction, client);
      }

      // 🔹 Outros tipos (modals, menus, etc.)
      else {
        // Podemos adicionar suporte futuro aqui
      }
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Ocorreu um erro ao processar a interação.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Algo deu errado.', ephemeral: true });
      }
    }
  }
};
