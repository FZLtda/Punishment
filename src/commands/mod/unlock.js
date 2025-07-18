'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'unlock',
  description: 'Desbloqueia o canal atual para que os membros possam enviar mensagens.',
  usage: '${currentPrefix}unlock [motivo]',
  category: 'Moderação',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const motivo = args.join(' ') || 'Não especificado.';
    const canal = message.channel;

    try {
      const jáDesbloqueado = !canal.permissionOverwrites.cache.get(message.guild.roles.everyone.id)?.deny.has(PermissionsBitField.Flags.SendMessages);
      if (jáDesbloqueado) return sendError(message, 'Este canal já está desbloqueado.');

      await canal.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.unlock} Canal desbloqueado`)
        .setColor(colors.green)
        .setDescription(`Este canal foi desbloqueado com sucesso.`)
        .addFields(
          { name: 'Canal', value: `${canal}`, inline: true },
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await canal.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Unlock',
        moderator: message.author,
        reason: motivo,
        channel: canal
      });

    } catch (error) {
      console.error(error);
      return sendError(message, 'Não foi possível desbloquear o canal devido a um erro inesperado.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
