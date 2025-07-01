const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

/**
 * Paginador genérico para mensagens com múltiplos embeds
 * @param {Message} message - Mensagem original do comando
 * @param {EmbedBuilder[]} pages - Array de páginas (embeds)
 * @param {Object} options - { timeout: ms, ephemeral: true|false }
 */
async function paginate(message, pages, options = {}) {
  if (!pages || pages.length <= 1) return message.channel.send({ embeds: [pages[0]] });

  let page = 0;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('anterior')
      .setLabel('◀️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('proximo')
      .setLabel('▶️')
      .setStyle(ButtonStyle.Secondary)
  );

  const reply = await message.channel.send({
    embeds: [pages[page]],
    components: [row],
    allowedMentions: { repliedUser: false }
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: options.timeout || 60_000
  });

  collector.on('collect', async i => {
    if (i.user.id !== message.author.id) {
      return i.reply({ content: 'Você não pode usar estes botões.', ephemeral: true });
    }

    i.customId === 'proximo'
      ? page = (page + 1) % pages.length
      : page = (page - 1 + pages.length) % pages.length;

    await i.update({ embeds: [pages[page]] });
  });

  collector.on('end', () => {
    reply.edit({ components: [] }).catch(() => null);
  });
}

module.exports = { paginate };
