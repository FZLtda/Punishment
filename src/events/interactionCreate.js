const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

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
        return interaction.reply({ content: 'Você já está participando!', ephemeral: true });
      }

      participants.push(interaction.user.id);
      db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?').run(JSON.stringify(participants), interaction.message.id);

      
      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('participar').setLabel('Participar 🎟').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ver_participantes').setLabel('👥 Participantes: 0').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );

      await interaction.message.edit({ components: [updatedRow] });

      return interaction.reply({ content: '🎟 Você entrou no sorteio!', ephemeral: true });
    }

    if (interaction.customId === 'ver_participantes') {
      return interaction.reply({ content: `👥 Participantes: ${participants.length}`, ephemeral: true });
    }
  },
};
