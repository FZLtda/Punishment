const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { converterTempo } = require('@utils/giveawayUtils');
const { criarSorteio, agendarEncerramento } = require('@core/giveawayManager');

module.exports = {
  name: 'giveaway',
  description: 'Gerencia sorteios no servidor.',
  usage: '.giveaway start <tempo> <quantidade> <prêmio>',
  userPermissions: ['Administrator'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    try {
      if (args[0] !== 'start') {
        return enviarErro(message, 'Uso correto: .giveaway start <tempo> <quantidade> <prêmio>');
      }

      const tempoInput = args[1];
      const quantidade = parseInt(args[2]);
      const premio = args.slice(3).join(' ');

      if (!tempoInput || isNaN(quantidade) || quantidade <= 0 || !premio) {
        return enviarErro(message, 'Uso correto: .giveaway start <tempo> <quantidade> <prêmio>');
      }

      const tempoMs = converterTempo(tempoInput);
      if (!tempoMs) {
        return enviarErro(message, 'Formato de tempo inválido! Use 1m, 1h ou 1d.');
      }

      const { message: sorteioMsg, endTime } = await criarSorteio({
        client: message.client,
        guild: message.guild,
        channel: message.channel,
        durationMs: tempoMs,
        winnerCount: quantidade,
        prize: premio,
        hostId: message.author.id,
      });

      agendarEncerramento({
        messageId: sorteioMsg.id,
        guildId: message.guild.id,
        client: message.client,
        timeout: tempoMs,
      });

      message.delete().catch(() => null);
    } catch (err) {
      console.error(`[ERRO] Comando giveaway: ${err}`);
      enviarErro(message, 'Ocorreu um erro ao iniciar o sorteio.');
    }
  },
};

function enviarErro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.icon_attention });

  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
