const db = require('../database/db');

module.exports = async (interaction, client) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'prefix-config-modal') return;

  const newPrefix = interaction.fields.getTextInputValue('new-prefix');
  await db.set(`prefix_${interaction.guild.id}`, newPrefix);

  await interaction.reply({
    content: `Prefixo atualizado para \`${newPrefix}\` com sucesso!`,
    ephemeral: true
  });
};
