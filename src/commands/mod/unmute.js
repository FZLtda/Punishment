'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendWarning } = require('@embeds/embedWarning');
const { checkMemberGuard } = require('@permissions/memberGuards');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  usage: '${currentPrefix}unmute <@usuário> [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    const isValid = await checkMemberGuard(message, membro, 'unmute');
    if (!isValid) return;

    if (!membro.communicationDisabledUntilTimestamp)
      return sendWarning(message, 'Este usuário não está silenciado no momento.');

    try {
      await membro.timeout(null, motivo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.unmute} Punição removida`)
        .setColor(colors.green)
        .setDescription(`${membro} (\`${membro.id}\`) teve o mute removido com sucesso.`)
        .addFields({ name: 'Motivo', value: `\`${motivo}\`` })
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Unmute',
        target: membro.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, 'Não foi possível remover o mute do usuário devido a um erro inesperado.');
    }
  }
};
