const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

async function paginate(interaction, pages, options = {}) {
  let paginaAtual = 0;

  const botaoAnterior = new ButtonBuilder()
    .setCustomId('anterior')
    .setStyle(ButtonStyle.Secondary)
    .setLabel('◀️');

  const botaoProximo = new ButtonBuilder()
    .setCustomId('proximo')
    .setStyle(ButtonStyle.Secondary)
    .setLabel('▶️');

  const linha = () =>
    new ActionRowBuilder().addComponents(botaoAnterior, botaoProximo);

  const resposta = await interaction.reply({
    embeds: [pages[paginaAtual]],
    components: [linha()],
    ephemeral: true
  });

  const coletor = resposta.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: options.timeout || 60_000
  });

  coletor.on('collect', async i => {
    if (i.user.id !== interaction.user.id)
      return i.reply({ content: 'Esses botões não são seus.', ephemeral: true });

    paginaAtual =
      i.customId === 'anterior'
        ? (paginaAtual - 1 + pages.length) % pages.length
        : (paginaAtual + 1) % pages.length;

    await i.update({ embeds: [pages[paginaAtual]] });
  });

  coletor.on('end', () => {
    resposta.edit({ components: [] }).catch(() => null);
  });
}

module.exports = { paginate };
