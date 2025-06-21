const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'verifysetup',
  description: 'Envia o painel de verificação no canal.',
  usage: '${currentPrefix}verifysetup',
  userPermissions: ['Administrator'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    
    if (message.author.id !== '1006909671908585586') return;
    
    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle('Verificação Necessária')
      .setDescription('Clique no botão abaixo para se verificar e ter acesso completo ao servidor.')
      .setFooter({
        text: `${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Verificar')
        .setStyle(ButtonStyle.Success)
        .setEmoji(emojis.check)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  },
};
