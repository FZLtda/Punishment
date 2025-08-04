'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'lock',
  description: 'Bloqueia o canal atual para que os membros não possam enviar mensagens.',
  usage: '${currentPrefix}lock [motivo]',
  category: 'Moderação',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const motivo = args.join(' ') || 'Não especificado.';
    const canal = message.channel;

    try {
      const jaBloqueado = canal.permissionOverwrites.cache
        .get(message.guild.roles.everyone.id)
        ?.deny.has(PermissionsBitField.Flags.SendMessages);

      if (jaBloqueado) {
        return sendWarning(message, 'Este canal já está bloqueado.');
      }

      await canal.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.lock} Canal bloqueado`)
        .setColor(colors.red)
        .setDescription(`Este canal foi bloqueado com sucesso.`)
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
        action: 'Lock',
        moderator: message.author,
        reason: motivo,
        channel: canal
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, 'Não foi possível bloquear o canal devido a um erro inesperado.');
    }
  }
};
