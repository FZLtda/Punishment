const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} = require('discord.js');
const { categories, getCommandsByCategory } = require('../utils/commandUtils');
const { createPagination } = require('../utils/pagination');

module.exports = {
  name: 'test',
  description: 'Veja todos os comandos disponíveis por categoria.',
  usage: '.test',
  category: 'info',

  execute: async (client, messageOrInteraction, args) => {
    // Detecta se é uma interação (slash command)
    const isInteraction = !!messageOrInteraction.isCommand;

    // Obtém o canal para enviar mensagem
    const channel = isInteraction
      ? messageOrInteraction.channel
      : messageOrInteraction.channel;

    if (!channel) {
      return console.error('Canal não encontrado para enviar a mensagem');
    }

    // Obtém o userId para filtro dos botões
    const userId = isInteraction
      ? messageOrInteraction.user.id
      : messageOrInteraction.author.id;

    // Monta os botões para categorias
    const buttons = Object.keys(categories).map((key) =>
      new ButtonBuilder()
        .setCustomId(`help_${key}_${userId}`)
        .setLabel(categories[key].label)
        .setEmoji(categories[key].emoji)
        .setStyle(ButtonStyle.Secondary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    // Cria o embed inicial
    const embed = new EmbedBuilder()
      .setTitle('🧭 Ajuda do Punishment')
      .setDescription('Escolha uma categoria abaixo para visualizar os comandos disponíveis.')
      .setColor('#2f3136');

    let msg;

    if (isInteraction) {
      // Se for interação, defere e responde com followUp
      await messageOrInteraction.deferReply();
      msg = await messageOrInteraction.followUp({ embeds: [embed], components: [row] });
    } else {
      // Se for mensagem normal, envia no canal
      msg = await channel.send({ embeds: [embed], components: [row] });
    }

    // Coletor para os botões
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
      filter: i => i.user.id === userId
    });

    collector.on('collect', async (interaction) => {
      const parts = interaction.customId.split('_');
      if (parts.length !== 3) {
        return interaction.reply({ content: 'Botão inválido.', ephemeral: true });
      }

      const [_, category, id] = parts;

      if (id !== userId) {
        return interaction.reply({
          content: 'Esses botões não são para você.',
          ephemeral: true
        });
      }

      const commandList = getCommandsByCategory(client.commands, category);

      if (!commandList.length) {
        return interaction.reply({
          content: 'Nenhum comando encontrado nessa categoria.',
          ephemeral: true
        });
      }

      const pages = commandList.map((cmd, idx) =>
        new EmbedBuilder()
          .setTitle(`${categories[category].emoji} ${categories[category].label}`)
          .setDescription(
            `**Comando:** \`${cmd.name}\`\n` +
            `**Descrição:** ${cmd.description || 'Sem descrição'}\n` +
            `**Uso:** \`${cmd.usage || 'N/A'}\``
          )
          .setFooter({ text: `Comando ${idx + 1} de ${commandList.length}` })
          .setColor('#2f3136')
      );

      await createPagination(interaction, pages);
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
