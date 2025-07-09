'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendEmbed } = require('@utils/embedReply');
const { checkMemberGuard } = require('@utils/memberGuards');

module.exports = {
  name: 'ban',
  description: 'Bane permanentemente um membro do servidor.',
  usage: '${currentPrefix}ban <@usuário> [motivo]',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    const isValid = await checkMemberGuard(message, membro, 'ban');
    if (!isValid) return;

    try {
      await membro.ban({ reason: motivo });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.ban} Punição aplicada`)
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi banido permanentemente.`)
        .addFields({ name: 'Motivo', value: `\`${motivo}\`` })
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Ban',
        target: membro.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(error);
      return sendEmbed('red', message, 'Não foi possível banir o usuário devido a um erro inesperado.');
    }
  }
};
