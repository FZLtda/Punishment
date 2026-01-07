'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { sendWarning } = require('@embeds/embedWarning');
const { emojis, colors, bot } = require('@config');

module.exports = {
  name: 'violations',
  description: 'Lista todos os usuários banidos globalmente do bot.',
  usage: '${currentPrefix}violations',
  deleteMessage: true,
  devOnly: true,

  async execute(message) {
    if (message.author.id !== bot.ownerId)
      return;

    const bans = await GlobalBan.find();

    if (!bans.length)
      return sendWarning(message, 'Não há usuários banidos globalmente no momento.');

    const lista = await Promise.all(
      bans.slice(0, 10).map(async (ban, index) => {
        const usuarioBanido = await message.client.users
          .fetch(ban.userId)
          .catch(() => null);

        const autorBan = await message.client.users
          .fetch(ban.bannedBy)
          .catch(() => null);

        const nomeBanido = usuarioBanido
          ? `${usuarioBanido.tag}`
          : 'Usuário não encontrado';

        const nomeAutor = autorBan
          ? `${autorBan.tag}`
          : 'Desconhecido';

        return (
          `**${index + 1}.** ${nomeBanido}\n` +
          `🆔 ID: \`${ban.userId}\`\n` +
          `📝 Motivo: *${ban.reason}*\n` +
          `👮 Banido por: ${nomeAutor}`
        );
      })
    );

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.ban} Usuários Banidos Globalmente`)
      .setDescription(lista.join('\n\n'))
      .setFooter({
        text: `Total de banidos: ${bans.length}`,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
