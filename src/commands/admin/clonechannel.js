const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'clonechannel',
  description: 'Clona o canal atual, preservando as permissões e configurações.',
  usage: '${currentPrefix}clonechannel',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message) {
    const canalOriginal = message.channel;

    try {
      const novoCanal = await canalOriginal.clone({
        name: canalOriginal.name,
        type: canalOriginal.type,
        topic: canalOriginal.topic,
        nsfw: canalOriginal.nsfw,
        bitrate: canalOriginal.bitrate,
        userLimit: canalOriginal.userLimit,
        rateLimitPerUser: canalOriginal.rateLimitPerUser,
        reason: `Canal clonado por ${message.author.tag}`
      });

      await novoCanal.setPosition(canalOriginal.position + 1).catch(() => null);

      const embedSucesso = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({
          name: `O canal ${canalOriginal.name} foi clonado com sucesso.`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        });

      return message.channel.send({ embeds: [embedSucesso] });
    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível clonar o canal devido a um erro.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
