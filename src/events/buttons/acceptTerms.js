module.exports = async (interaction) => {
  const command = interaction.client.commands.get('acceptTerms');
  if (command) {
    return await command.execute(interaction);
  }
  return interaction.reply({ content: 'Erro ao processar os Termos de Uso.', ephemeral: true });
};
