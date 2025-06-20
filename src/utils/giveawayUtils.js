const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { red } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');

// !Formata números (ex: 1000 → 1.000)
const formatNumber = (num) => new Intl.NumberFormat('pt-BR').format(num);

// !Converte string como "1h", "30m" em milissegundos
function converterTempo(tempo = '') {
  const match = tempo.match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();

  const unidades = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return unidades[unidade] ? valor * unidades[unidade] : null;
}

// !Embed inicial do sorteio
function gerarEmbedInicial(prize = 'Indefinido', winnerCount = 1, endTime = Date.now(), messageId = null) {
  const idVisivel = messageId ?? 'A definir...';

  return new EmbedBuilder()
    .setTitle(`🎉 Sorteio (ID: ${idVisivel})`)
    .setDescription(
      `🎁 **Prêmio:** \`${prize}\`\n` +
      `🏆 **${winnerCount === 1 ? 'Ganhador' : 'Ganhadores'}:** \`${winnerCount}\`\n` +
      `⏰ **Termina:** <t:${Math.floor(endTime / 1000)}:f> — (<t:${Math.floor(endTime / 1000)}:R>)`
    )
    .setColor(red)
    .setFooter({ text: 'Clique no botão abaixo para participar!' });
}

// !Embed final do sorteio
function gerarEmbedFinal(prize, total, winners = [], messageId = 'Desconhecido', endedAt = new Date()) {
  const mencoes = winners.length > 0
    ? winners.map(id => `<@${id}>`).join(', ')
    : '`Nenhum vencedor`';

  return new EmbedBuilder()
    .setTitle(`🎊 Sorteio Encerrado (ID: ${messageId})`)
    .setDescription(
      `🎁 **Prêmio:** \`${prize}\`\n` +
      `🎟 **Participantes:** \`${formatNumber(total)}\`\n` +
      `🏆 **${winners.length === 1 ? 'Ganhador' : 'Ganhadores'}:** ${mencoes}\n\n` +
      `🕔 **Encerrado:** <t:${Math.floor(endedAt.getTime() / 1000)}:f>`
    )
    .setColor(red)
    .setFooter({ text: 'Sorteio finalizado automaticamente.' });
}

// !Mensagem pública para os vencedores
function gerarMensagemVencedores(winners = [], prize = 'Indefinido') {
  if (winners.length === 0) {
    return `${attent} Nenhum vencedor foi escolhido, pois não houve participantes.`;
  }

  const mencoes = winners.map(id => `<@${id}>`).join(', ');

  return winners.length === 1
    ? `🎉 Parabéns ${mencoes}! Você ganhou o **${prize}**!`
    : `🎉 Parabéns ${mencoes}! Vocês ganharam o **${prize}**!`;
}

// !Botões interativos
function gerarComponentesInterativos(participantCount = 0) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('participar')
      .setLabel('🎟 Participar')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('ver_participantes')
      .setLabel(`👥 Participantes: ${participantCount}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
}

module.exports = {
  converterTempo,
  gerarEmbedInicial,
  gerarEmbedFinal,
  gerarMensagemVencedores,
  gerarComponentesInterativos,
};
