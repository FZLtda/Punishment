const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { red } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');

function gerarEmbedInicial(prize, winnerCount, endTime, messageId) {
  return new EmbedBuilder()
    .setTitle(`Sorteio (ID: ${messageId})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Ganhador(es):** \`${winnerCount}\`\n` +
      `**Termina em:** <t:${Math.floor(endTime / 1000)}:f> (<t:${Math.floor(endTime / 1000)}:R>)`
    )
    .setColor(red)
    .setFooter({ text: 'Clique no botão abaixo para participar!' });
}

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

function gerarEmbedFinal(prize, total, winners, messageId, endedAt = new Date()) {
  return new EmbedBuilder()
    .setTitle(`Sorteio Finalizado (ID: ${messageId})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Participantes:** \`${total}\`\n` +
      `**Ganhador(es):** ${winners.length > 0 ? winners.join(', ') : '`Nenhum vencedor`'}\n\n` +
      `**Encerrado em:** <t:${Math.floor(endedAt.getTime() / 1000)}:f>`
    )
    .setColor(red)
    .setFooter({ text: 'Sorteio encerrado!' });
}

function gerarMensagemVencedores(winners, prize) {
  if (winners.length === 0) {
    return `${attent} Nenhum vencedor foi escolhido porque ninguém participou.`;
  }

  const mencoes = winners.map(id => `<@{id}>`).join(', ');
  return winners.length === 1
    ? `🎉 Parabéns ${mencoes}! Você ganhou o **${prize}**!`
    : `🎉 Parabéns ${mencoes}! Vocês ganharam o **${prize}**!`;
}

function converterTempo(tempo) {
  const match = tempo.match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const valor = parseInt(match[1]);
  const unidade = match[2].toLowerCase();

  switch (unidade) {
    case 's': return valor * 1000;
    case 'm': return valor * 60000;
    case 'h': return valor * 3600000;
    case 'd': return valor * 86400000;
    default: return null;
  }
}

module.exports = {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
  converterTempo,
};
