const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

async function handleButtonInteraction(interaction, client, db) {
  try {
    if (interaction.customId === 'accept_terms') {
      const command = client.commands.get('acceptTerms');
      if (command) {
        return await command.execute(interaction);
      }
      return interaction.reply({ content: 'Erro ao processar os Termos de Uso.', ephemeral: true });
    }

    const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
    if (!giveaway) return;

    let participants = JSON.parse(giveaway.participants);

    if (interaction.customId === 'participar') {
      if (participants.includes(interaction.user.id)) {
        return interaction.reply({
          content: 'Você já está concorrendo neste sorteio!',
          ephemeral: true,
        });
      }

      participants.push(interaction.user.id);
      db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?')
        .run(JSON.stringify(participants), interaction.message.id);

      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('participar')
          .setLabel('🎟 Participar')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ver_participantes')
          .setLabel(`👥 Participantes: ${participants.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await interaction.update({ components: [updatedRow] });
      return interaction.followUp({
        content: 'Sua entrada no sorteio foi registrada!',
        ephemeral: true,
      });
    }

    if (interaction.customId === 'ver_participantes') {
      return interaction.reply({
        content: `👥 Participantes: ${participants.length}`,
        ephemeral: true,
      });
    }
  } catch (error) {
    logger.error(`Erro ao processar interação de botão "${interaction.customId}": ${error.message}`, { stack: error.stack });
    return interaction.reply({
      content: 'Ocorreu um erro ao processar sua interação.',
      ephemeral: true,
    });
  }
}

module.exports = { handleButtonInteraction };