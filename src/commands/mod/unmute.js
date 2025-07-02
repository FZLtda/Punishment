'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');

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

    if (!membro)
      return sendErro(message, 'Mencione um usuário para executar esta ação.');

    if (!membro.communicationDisabledUntilTimestamp)
      return sendErro(message, 'Este usuário não está silenciado no momento.');

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

      // Log no canal de moderação
      await sendModLog(message.guild, {
        action: 'Unmute',
        target: membro.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(error);
      return sendErro(message, 'Não foi possível remover o mute do usuário devido a um erro inesperado.');
    }
  }
};

function sendErro(message, texto) {
  const embedErro = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
}
