'use strict';

const { ChannelType, EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'slowmode',
  description: 'Define o tempo de espera entre mensagens em um canal de texto.',
  usage: '${currentPrefix}slowmode <tempo (ex: 10s, 1m, 1h, 0s)> [motivo]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    // Validação de argumentos
    const tempo = args[0];
    if (!tempo)
      return sendWarning(message, 'Você deve fornecer um tempo válido. Ex: `10s`, `5m`, `0s`.');

    const segundos = parseTempo(tempo);
    if (segundos === null || segundos < 0 || segundos > 21600)
      return sendWarning(message, 'Tempo inválido. O valor deve estar entre `0s` e `6h` (21600 segundos).');

    const motivo = args.slice(1).join(' ').trim() || 'Sem motivo fornecido.';
    const canal = message.channel;

    // Verificações de contexto
    if (canal.type !== ChannelType.GuildText)
      return sendWarning(message, 'Este comando só pode ser executado em canais de texto.');
    if (canal.rateLimitPerUser === segundos)
      return sendWarning(message, `O modo lento já está definido como \`${tempo}\` neste canal.`);

    // Aplicando o slowmode
    try {
      await canal.setRateLimitPerUser(segundos, motivo);

      const embed = new EmbedBuilder()
        .setColor(segundos === 0 ? colors.green : 0xFE3838)
        .setTitle(`${emojis?.slow} Modo Lento Atualizado`)
        .setDescription(
          segundos === 0
            ? 'O tempo entre mensagens neste canal foi **desativado** com sucesso.'
            : `O tempo entre mensagens neste canal foi definido para \`${tempo}\`.`
        )
        .addFields({ name: 'Motivo', value: motivo })
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await canal.send({ embeds: [embed] });

      // Log de moderação
      await sendModLog(message.guild, {
        action: 'Slowmode',
        target: canal,
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
      return sendWarning(message, 'Ocorreu um erro ao aplicar o modo lento. Verifique se o bot tem as permissões adequadas.');
    }
  }
};

// Utilitário para converter tempo humano em segundos
function parseTempo(tempo) {
  const match = tempo.match(/^(\d+)([smh])$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const multiplicador = { s: 1, m: 60, h: 3600 };
  return multiplicador[unidade] ? valor * multiplicador[unidade] : null;
}
