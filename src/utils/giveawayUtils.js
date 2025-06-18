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
    .setTitle(`🎉 Sorteio (ID: ${messageId || 'Em breve'})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Ganhador(es):** \`${winnerCount}\`\n` +
      `**Termina em:** <t:${Math.floor(endTime / 1000)}:f> (<t:${Math.floor(endTime / 1000)}:R>)`
    )
    .setColor(red)
    .setFooter({ text: 'Clique no botão abaixo para participar!' });
}

/**
 * Gera os botões interativos
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
 * Gera o embed final do sorteio
 */
function gerarEmbedFinal(prize, total, winners = [], messageId = 'Em breve', endedAt = new Date()) {
  const mencoes = winners.length > 0
    ? winners.map(id => `<@${id.replace(/[<@!>]/g, '')}>`).join(', ')
    : '`Nenhum vencedor`';

  return new EmbedBuilder()
    .setTitle(`🎊 Sorteio Finalizado (ID: ${messageId})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Participantes:** \`${total}\`\n` +
      `**Ganhador(es):** ${mencoes}\n\n` +
      `**Encerrado em:** <t:${Math.floor(endedAt.getTime() / 1000)}:f>`
    )
    .setColor(red)
    .setFooter({ text: 'Sorteio encerrado!' });
}

/**
 * Mensagem que menciona o(s) vencedor(es)
 */
function gerarMensagemVencedores(winners = [], prize) {
  if (winners.length === 0) {
    return `${attent} Nenhum vencedor foi escolhido porque ninguém participou.`;
  }

  // Sanitiza qualquer menção acidental
  const mencoes = winners.map(id => `<@${id.replace(/[<@!>]/g, '')}>`).join(', ');

  return winners.length === 1
    ? `🎉 Parabéns ${mencoes}! Você ganhou o **${prize}**!`
    : `🎉 Parabéns ${mencoes}! Vocês ganharam o **${prize}**!`;
}

/**
 * Converte 10s/10m/10h/10d para milissegundos
 */
function converterTempo(tempo) {
  const match = tempo.match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const mapa = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return mapa[unidade] || null;
}

module.exports = {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
  converterTempo,
};
