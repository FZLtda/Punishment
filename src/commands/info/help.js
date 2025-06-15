const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} = require('discord.js');

const { categories, getCommandsByCategory } = require('../../utils/commandUtils');
const { createPagination } = require('../../utils/pagination');
const { primary } = require('../../config/colors.json');

module.exports = {
  name: 'test',
  description: 'Veja todos os comandos organizados por categoria.',
  usage: '.help',
  category: 'info',

  execute: async (client, ctx) => {
    const isInteraction = !!ctx.isChatInputCommand;

    const user = isInteraction ? ctx.user : ctx.author;
    const channel = ctx.channel;

    if (!user || !channel) return;

    const userId = user.id;

    const row = new ActionRowBuilder().addComponents(
      Object.entries(categories).map(([key, data]) =>
        new ButtonBuilder()
          .setCustomId(`help_${key}_${userId}`)
          .setLabel(data.label)
          .setEmoji(data.emoji)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const embed = new EmbedBuilder()
      .setTitle('📚 Painel de Comandos')
      .setDescription('Selecione uma categoria para visualizar os comandos disponíveis.')
      .setColor(primary)
      .setFooter({ text: `Punishment © FuncZero`, iconURL: client.user.displayAvatarURL() });

    const sent = isInteraction
      ? await ctx.reply({ embeds: [embed], components: [row], ephemeral: true })
      : await channel.send({ embeds: [embed], components: [row] });

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === userId,
      time: 2 * 60_000
    });

    collector.on('collect', async interaction => {
      const [_, category, uid] = interaction.customId.split('_');
      if (uid !== userId) {
        return interaction.reply({ content: '❌ Esses botões não são para você.', ephemeral: true });
      }

      const commands = getCommandsByCategory(client.commands, category);
      if (!commands.length) {
        return interaction.reply({ content: '⚠️ Nenhum comando nessa categoria.', ephemeral: true });
      }

      const pages = commands.map((cmd, i) =>
        new EmbedBuilder()
          .setTitle(`${categories[category].emoji} ${categories[category].label}`)
          .setDescription(
            `**Nome:** \`${cmd.name}\`\n` +
            `**Descrição:** ${cmd.description || 'Sem descrição'}\n` +
            `**Uso:** \`${cmd.usage || 'N/A'}\``
          )
          .setFooter({ text: `Comando ${i + 1} de ${commands.length}` })
          .setColor(primary)
      );

      await createPagination(interaction, pages);
    });

    collector.on('end', () => {
      sent.edit({ components: [] }).catch(() => {});
    });
  }
};
