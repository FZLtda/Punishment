'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { checkMemberGuard } = require('@permissions/memberGuards');
const { sendModLog } = require('@modules/modlog');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'unlockuser',
  description: 'Permite que um usuário volte a enviar mensagens no canal atual.',
  usage: '${currentPrefix}unlockuser <@usuário>',
  category: 'Moderação',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const target =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, target, 'role');
    if (!isValid) return;

    try {
      await message.channel.permissionOverwrites.edit(target, {
        SendMessages: true
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.unlock} Punição removida`)
        .setColor(colors.green)
        .setDescription(`${target} (\`${target.id}\`) pode novamente enviar mensagens neste canal.`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Desbloqueio de Canal',
        target: target.user,
        moderator: message.author,
        reason: `Desbloqueado para enviar mensagens no canal ${message.channel}`
      });

    } catch (error) {
      console.error('[unlockuser] Erro ao desbloquear usuário:', error);
      return sendWarning(message, 'Não foi possível desbloquear o usuário devido a um erro inesperado.');
    }
  }
};
