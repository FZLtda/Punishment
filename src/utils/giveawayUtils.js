const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { red } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');

// Formatar números de forma legível
const formatNumber = (num) => new Intl.NumberFormat('pt-BR').format(num);

function gerarEmbedInicial(prize = 'Indefinido', winnerCount = 1, endTime = Date.now(), messageId = null) {
  const idVisivel = messageId ?? 'Em breve';

  return new EmbedBuilder()
    .setTitle(`🎉 Sorteio ID: ${idVisivel}`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**${winnerCount === 1 ? 'Ganhador' : 'Ganhadores'}:** \`${winnerCount}\`\n` +
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

function gerarEmbedFinal(prize = 'Indefinido', total = 0, winners = [], messageId = 'Desconhecido', endedAt = new Date()) {
  const mencoes = winners.length > 0
    ? winners.map(id => `<@${String(id).replace(/[<@!>]/g, '')}>`).join(', ')
    : '`Nenhum vencedor`';

  return new EmbedBuilder()
    .setTitle(`🎊 Sorteio Finalizado (ID: ${messageId})`)
    .setDescription(
      `**Prêmio:** \`${prize}\`\n` +
      `**Participantes:** \`${formatNumber(total)}\`\n` +
      `**${winners.length === 1 ? 'Ganhador' : 'Ganhadores'}:** ${mencoes}\n\n` +
      `**Encerrado em:** <t:${Math.floor(endedAt.getTime() / 1000)}:f>`
    )
    .setColor(red)
    .setFooter({ text: 'Sorteio encerrado!' });
}

function gerarMensagemVencedores(winners = [], prize = 'Indefinido') {
  if (winners.length === 0) {
    return `${attent} Nenhum vencedor foi escolhido porque ninguém participou.`;
  }

  const mencoes = winners.map(id => `<@${String(id).replace(/[<@!>]/g, '')}>`).join(', ');

  return winners.length === 1
    ? `🎉 Parabéns ${mencoes}! Você ganhou o **${prize}**!`
    : `🎉 Parabéns ${mencoes}! Vocês ganharam o **${prize}**!`;
}

function converterTempo(tempo = '') {
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
