'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@utils/embedWarning');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'unban',
  description: 'Remove o banimento de um usuário pelo ID.',
  usage: '${currentPrefix}unban <ID do usuário> [motivo]',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const userId = args[0];
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!userId || !/^\d{17,19}$/.test(userId)) {
      return sendWarning(message, 'Forneça um ID de usuário válido para remover o banimento.');
    }

    try {
      const banInfo = await message.guild.bans.fetch(userId).catch(() => null);
      if (!banInfo) {
        return sendWarning(message, 'Este usuário não está banido ou o ID é inválido.');
      }

      await message.guild.members.unban(userId, motivo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.unban} Banimento removido`)
        .setColor(colors.green)
        .setDescription(`${banInfo.user.tag} (\`${userId}\`) teve o banimento removido com sucesso.`)
        .addFields({ name: 'Motivo', value: `\`${motivo}\`` })
        .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Unban',
        target: banInfo.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, 'Não foi possível remover o banimento do usuário.');
    }
  }
};
