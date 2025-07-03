'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'slowmode',
  description: 'Define o tempo de espera entre mensagens em um canal.',
  usage: '${currentPrefix}slowmode <tempo (ex: 10s, 1m, 1h)> [motivo]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const tempo = args[0];
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!tempo) return sendError(message, 'Forneça a duração do slowmode. Exemplo: `10s`, `1m`, `30s`.');

    const segundos = convertToSeconds(tempo);
    if (segundos === null || segundos < 0 || segundos > 21600)
      return sendError(message, 'Duração inválida. O limite é entre `0s` e `6h` (21600 segundos).');

    if (message.channel.type !== ChannelType.GuildText)
      return sendError(message, 'Este comando só pode ser usado em canais de texto.');

    try {
      await message.channel.setRateLimitPerUser(segundos, motivo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.slow} Modo lento`)
        .setColor(colors.red)
        .setDescription(`O tempo entre mensagens neste canal foi definido para \`${tempo}\`.`)
        .addFields({ name: 'Motivo', value: motivo, inline: false })
        .setTimestamp()
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      await message.channel.send({ embeds: [embed] });

      // Log de moderação
      await sendModLog(message.guild, {
        action: 'Slowmode',
        target: message.channel,
        moderator: message.author,
        reason: motivo,
        extraFields: [{ name: 'Duração', value: tempo, inline: true }]
      });

    } catch (err) {
      console.error(err);
      return sendError(message, 'Não foi possível aplicar o slowmode neste canal.');
    }
  }
};

function convertToSeconds(tempo) {
  const match = tempo.match(/^(\d+)([smh])$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  switch (unidade) {
    case 's': return valor;
    case 'm': return valor * 60;
    case 'h': return valor * 3600;
    default: return null;
  }
}

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
