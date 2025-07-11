'use strict';

const { ChannelType, EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'slowmode',
  description: 'Define o tempo de espera entre mensagens em um canal de texto.',
  usage: '${currentPrefix}slowmode <tempo (ex: 10s, 1m, 1h)> [motivo]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const tempo = args[0];
    const motivo = args.slice(1).join(' ').trim() || 'Sem motivo fornecido.';

    if (!tempo)
      return sendEmbed('yellow', message, 'Você deve fornecer um tempo válido. Ex: `10s`, `5m`, `0s`.');

    const segundos = parseTempo(tempo);

    if (segundos === null || segundos < 0 || segundos > 21600)
      return sendEmbed('yellow', message, 'Tempo inválido. O valor deve estar entre `0s` e `6h` (21600 segundos).');

    if (message.channel.type !== ChannelType.GuildText)
      return sendEmbed('yellow', message, 'Este comando só pode ser executado em canais de texto.');

    const canalAtual = message.channel;

    if (canalAtual.rateLimitPerUser === segundos)
      return sendEmbed('yellow', message, `O modo lento já está definido como \`${tempo}\` neste canal.`);

    try {
      await canalAtual.setRateLimitPerUser(segundos, motivo);

      const descricao = segundos === 0
        ? 'O tempo entre mensagens neste canal foi desativado com sucesso.'
        : `O tempo entre mensagens neste canal foi definido para \`${tempo}\`.`;

      const embed = new EmbedBuilder()
        .setColor(segundos === 0 ? colors.green : 0xFE3838)
        .setTitle(`${emojis?.slow} Modo Lento Atualizado`)
        .setDescription(descricao)
        .addFields({ name: 'Motivo', value: motivo })
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: 'Slowmode',
        target: canalAtual,
        moderator: message.author,
        reason: motivo,
        extraFields: [{
          name: 'Duração',
          value: segundos === 0 ? 'Desativado' : `${segundos}s`,
          inline: true
        }]
      });

    } catch (err) {
      console.error('[slowmode] Erro ao aplicar modo lento:', err);
      return sendEmbed('yellow', message, 'Não foi possível atualizar o modo lento.');
    }
  }
};

function parseTempo(tempo) {
  const match = tempo.match(/^(\d+)(s|m|h)$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const fatores = { s: 1, m: 60, h: 3600 };
  return fatores[unidade] ? valor * fatores[unidade] : null;
}
