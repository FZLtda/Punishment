const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getCategories, getCommandsByCategory } = require('../../utils/helpUtils');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'test',
  description: 'Exibe todos os comandos disponíveis organizados por categoria.',
  usage: '${currentPrefix}test',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args, client) {
    const categories = getCategories('./src/commands');
    let currentPage = 0;

    const buildHelpEmbed = (page) => {
      const category = categories[page];
      const commands = getCommandsByCategory('./src/commands', category);

      const embed = new EmbedBuilder()
        .setTitle(`📚 Categoria: ${category}`)
        .setDescription(
          commands.map(cmd => `> \`${cmd.name}\` — ${cmd.description}`).join('\n') || '*Nenhum comando encontrado.*'
        )
        .setColor(yellow)
        .setFooter({ text: `Página ${page + 1} de ${categories.length}` });

      return embed;
    };

    const components = (page) => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`help_prev_${page}`)
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),

      new ButtonBuilder()
        .setCustomId('help_close')
        .setLabel('🗑️ Fechar')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`help_next_${page}`)
        .setLabel('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= categories.length - 1)
    );

    const embed = buildHelpEmbed(currentPage);
    const msg = await message.channel.send({
      embeds: [embed],
      components: [components(currentPage)],
    });

    const collector = msg.createMessageComponentCollector({
      time: 60_000,
      filter: (i) => i.user.id === message.author.id
    });

    collector.on('collect', async (interaction) => {
      await interaction.deferUpdate();

      if (interaction.customId === 'help_close') {
        collector.stop();
        return msg.delete().catch(() => {});
      }

      if (interaction.customId.startsWith('help_prev_')) currentPage--;
      else if (interaction.customId.startsWith('help_next_')) currentPage++;

      const newEmbed = buildHelpEmbed(currentPage);
      await msg.edit({ embeds: [newEmbed], components: [components(currentPage)] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
