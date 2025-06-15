const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { red } = require('../config/colors.json');

module.exports = {
  name: 'verifysetup',
  description: 'Envia o painel de verificação no canal.',
  usage: '${currentPrefix}verifysetup',
  userPermissions: ['Administrator'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(red)
      .setTitle('Verificação Necessária')
      .setDescription('Clique no botão abaixo para se verificar e ter acesso completo ao servidor.')
      .setFooter({
        text: `${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Verificar')
        .setStyle(ButtonStyle.Success)
        .setEmoji('1219815388921991259')
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
