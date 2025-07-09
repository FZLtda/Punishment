'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendEmbed } = require('@utils/embedReply');
const { checkMemberGuard } = require('@utils/memberGuards');

module.exports = {
  name: 'mute',
  description: 'Aplica um timeout (mute) em um membro.',
  usage: '${currentPrefix}mute <@usuário> <duração> [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const tempo = args[1];
    const motivo = args.slice(2).join(' ') || 'Não especificado.';

    if (!tempo)
      return sendEmbed('yellow', message, 'Defina um tempo de duração para prosseguir (ex: 1m, 1h, 1d).');

    const duracao = convertToMilliseconds(tempo);
    if (!duracao)
      return sendEmbed('yellow', message, 'Duração inválida. Forneça um valor válido (ex: 1m, 1h, 1d).');

    const isValid = await checkMemberGuard(message, membro, 'mute');
    if (!isValid) return;

    try {
      await membro.timeout(duracao, motivo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.mute} Punição aplicada`)
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi silenciado.`)
        .addFields(
          { name: 'Duração', value: `\`${tempo}\``, inline: true },
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Mute',
        target: membro.user,
        moderator: message.author,
        reason: motivo,
        extraFields: [{ name: 'Duração', value: tempo, inline: true }]
      });

    } catch (error) {
      console.error(error);
      return sendEmbed('red', message, 'Não foi possível silenciar o usuário devido a um erro inesperado.');
    }
  }
};

function convertToMilliseconds(tempo) {
  const regex = /^(\d+)([smhd])$/;
  const match = tempo.match(regex);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 's': return valor * 1000;
    case 'm': return valor * 60 * 1000;
    case 'h': return valor * 60 * 60 * 1000;
    case 'd': return valor * 24 * 60 * 60 * 1000;
    default: return null;
  }
}
