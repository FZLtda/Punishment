'use strict';

const { ChannelType, ChannelSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'embed_send',

  async execute(interaction) {
    const menu = new ChannelSelectMenuBuilder()
      .setCustomId('embed_channel_select')
      .setPlaceholder('Selecione o canal onde deseja publicar')
      .addChannelTypes(ChannelType.GuildText)
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: '📡 Escolha abaixo o canal de destino da embed:',
      components: [row],
      ephemeral: true
    });
  }
};
