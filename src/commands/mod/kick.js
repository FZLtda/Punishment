'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendWarning } = require('@utils/embedWarning');
const { checkMemberGuard } = require('@utils/memberGuards');

module.exports = {
  name: 'kick',
  description: 'Expulsa um membro do servidor.',
  usage: '${currentPrefix}kick <@usuário> [motivo]',
  category: 'Moderação',
  userPermissions: ['KickMembers'],
  botPermissions: ['KickMembers'],
  deleteMessage: true,

  /**
   * Executa o comando de kick.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  
  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, membro, 'kick');
    if (!isValid) return;

    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    try {
      await membro.kick(motivo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.kick} Punição aplicada`)
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi expulso(a) do servidor.`)
        .addFields({ name: 'Motivo', value: `\`${motivo}\`` })
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Kick',
        target: membro.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error('[kick] Erro ao expulsar membro:', error);
      return sendWarning(message,'Não foi possível expulsar o usuário devido a um erro inesperado.');
    }
  }
};
