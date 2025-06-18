const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { red } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');

/**
 * Gera o embed inicial do sorteio
 */
function gerarEmbedInicial(prize, winnerCount, endTime, messageId) {
  return new EmbedBuilder()
    .setTitle(`🎉 Sorteio (ID: ${messageId || 'Aguardando envio'})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Ganhador(es):** \`${winnerCount}\`\n` +
      `**Termina em:** <t:${Math.floor(endTime / 1000)}:f> (<t:${Math.floor(endTime / 1000)}:R>)`
    )
    .setColor(red)
    .setFooter({ text: 'Clique no botão abaixo para participar!' });
}

/**
 * Gera os botões interativos do sorteio
 */
function gerarComponentesInterativos() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('participar')
      .setLabel('🎟 Participar')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('ver_participantes')
      .setLabel('👥 Participantes: 0')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
}

/**
 * Gera o embed final após encerramento do sorteio
 */
function gerarEmbedFinal(prize, total, winners = [], messageId = 'Desconhecido', endedAt = new Date()) {
  const vencedoresFormatados = winners.length > 0
    ? winners.map(id => `<@${id}>`).join(', ')
    : '`Nenhum vencedor`';

  return new EmbedBuilder()
    .setTitle(`🎊 Sorteio Finalizado (ID: ${messageId})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Participantes:** \`${total}\`\n` +
      `**Ganhador(es):** ${vencedoresFormatados}\n\n` +
      `**Encerrado em:** <t:${Math.floor(endedAt.getTime() / 1000)}:f>`
    )
    .setColor(red)
    .setFooter({ text: 'Sorteio encerrado!' });
}

/**
 * Gera a mensagem de vencedores para envio no canal
 */
function gerarMensagemVencedores(winners = [], prize) {
  if (winners.length === 0) {
    return `${attent} Nenhum vencedor foi escolhido porque ninguém participou.`;
  }

  const mencoes = winners.map(id => `<@${id}>`).join(', ');
  const plural = winners.length > 1;

  return plural
    ? `🎉 Parabéns ${mencoes}! Vocês ganharam o **${prize}**!`
    : `🎉 Parabéns ${mencoes}! Você ganhou o **${prize}**!`;
}

/**
 * Converte tempo no formato 10s/10m/10h/10d para milissegundos
 */
function converterTempo(tempo) {
  const match = tempo.match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const unidades = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return unidades[unidade] ? valor * unidades[unidade] : null;
}

module.exports = {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
  converterTempo,
};
