const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { yellow, green, red } = require('../config/colors.json');
const { icon_attention, icon_success } = require('../config/emoji.json');

module.exports = {
  name: 'deletechannel',
  description: 'Exclui um canal do servidor.',
  usage: '${currentPrefix}deletechannel [canal]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const errorEmbed = (desc) =>
      new EmbedBuilder()
        .setColor(red)
        .setAuthor({ name: desc, iconURL: icon_attention });

    const successEmbed = (desc) =>
      new EmbedBuilder()
        .setColor(green)
        .setAuthor({ name: desc, iconURL: icon_success });

    const channel = message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    if (!channel)
      return message.reply({
        embeds: [errorEmbed('Canal não encontrado! Mencione um canal ou forneça um ID válido.')],
        allowedMentions: { repliedUser: false },
      });

    const canaisProtegidos = ['regras', 'anúncios', 'staff'];
    const nomeNormalizado = channel.name.toLowerCase();

    if (canaisProtegidos.includes(nomeNormalizado) || channel.id === message.guild.rulesChannelId)
      return message.reply({
        embeds: [errorEmbed('Este canal é protegido e não pode ser excluído.')],
        allowedMentions: { repliedUser: false },
      });

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply({
        embeds: [errorEmbed('Eu não tenho permissão para excluir canais!')],
        allowedMentions: { repliedUser: false },
      });

    const confirmEmbed = new EmbedBuilder()
      .setColor(yellow)
      .setAuthor({ name: `Tem certeza que deseja excluir o canal "${channel.name}"?`, iconURL: icon_attention })
      .setFooter({ text: 'Responda com "sim" em até 10 segundos para confirmar.' });

    const confirmationMessage = await message.reply({
      embeds: [confirmEmbed],
      allowedMentions: { repliedUser: false },
    });

    try {
      const filter = (msg) =>
        msg.author.id === message.author.id && msg.content.toLowerCase() === 'sim';

      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 10000,
        errors: ['time'],
      });

      if (collected) {
        await channel.delete(`Solicitado por ${message.author.tag}`);

        return message.channel.send({
          embeds: [successEmbed(`O canal **${channel.name}** foi excluído com sucesso!`)],
        });
      }
    } catch (err) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: 'Tempo esgotado! Cancelando a exclusão.', iconURL: icon_attention });

      return message.channel.send({ embeds: [timeoutEmbed] });
    }
  },
};
