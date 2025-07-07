'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');

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
      return sendError(message, 'Você deve fornecer um tempo válido. Ex: `10s`, `5m`, `0s`.');

    const segundos = parseTempo(tempo);
    if (segundos === null || segundos < 0 || segundos > 21600)
      return sendError(message, 'Tempo inválido. O valor deve estar entre `0s` e `6h` (21600 segundos).');

    if (message.channel.type !== ChannelType.GuildText)
      return sendError(message, 'Este comando só pode ser executado em canais de texto.');

    const canalAtual = message.channel;

    if (canalAtual.rateLimitPerUser === segundos)
      return sendError(message, `O modo lento já está definido como \`${tempo}\` neste canal.`);

    try {
      await canalAtual.setRateLimitPerUser(segundos, motivo);

      const descricao = segundos === 0
        ? 'O tempo entre mensagens neste canal foi **desativado** com sucesso.'
        : `O tempo entre mensagens neste canal foi definido para \`${tempo}\`.`;

      const embed = createSuccessEmbed({
        titulo: `${emojis.slow} Modo Lento Atualizado`,
        descricao,
        autor: message.author,
        motivo
      });

      await canalAtual.send({ embeds: [embed] });

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

    } catch (error) {
      console.error('Erro ao aplicar modo lento:', error);
      return sendError(message, 'Ocorreu um erro ao aplicar o modo lento. Verifique se o bot tem as permissões adequadas.');
    }
  }
};

/**
 * Converte uma string como "10s", "1m", "2h" em segundos.
 */
function parseTempo(tempo) {
  const match = tempo.match(/^(\d+)(s|m|h)$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const fatores = { s: 1, m: 60, h: 3600 };
  return fatores[unidade] ? valor * fatores[unidade] : null;
}

/**
 * Cria embed de sucesso padrão.
 */
function createSuccessEmbed({ titulo, descricao, autor, motivo }) {
  return new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .addFields({ name: 'Motivo', value: motivo })
    .setColor(colors.red)
    .setTimestamp()
    .setFooter({ text: `${autor.username}`, iconURL: autor.displayAvatarURL({ dynamic: true }) });
}

/**
 * Envia uma embed de erro padrão.
 */
function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setTitle(`${emojis.attent} Aviso`)
    .setDescription(texto)
    .setColor(colors.yellow)
    .setTimestamp();

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
