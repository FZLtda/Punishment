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
    const isInteraction = !!messageOrInteraction.isCommand;

    let channel;
    let userId;

    if (isInteraction) {
      userId = messageOrInteraction.user.id;
      channel = messageOrInteraction.channel;

      // Se não tiver canal (exemplo: DM), tenta abrir DM com o usuário
      if (!channel) {
        try {
          channel = await messageOrInteraction.user.createDM();
        } catch {
          return console.error('Não foi possível abrir DM com o usuário.');
        }
      }
    } else {
      userId = messageOrInteraction.author.id;
      channel = messageOrInteraction.channel;

      if (!channel) {
        return console.error('Canal da mensagem não encontrado.');
      }
    }

    const buttons = Object.keys(categories).map((key) =>
      new ButtonBuilder()
        .setCustomId(`help_${key}_${userId}`)
        .setLabel(categories[key].label)
        .setEmoji(categories[key].emoji)
        .setStyle(ButtonStyle.Secondary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    const embed = new EmbedBuilder()
      .setTitle('🧭 Ajuda do Punishment')
      .setDescription('Escolha uma categoria abaixo para visualizar os comandos disponíveis.')
      .setColor('#2f3136');

    let msg;

    if (isInteraction) {
      await messageOrInteraction.deferReply();
      msg = await messageOrInteraction.followUp({ embeds: [embed], components: [row] });
    } else {
      msg = await channel.send({ embeds: [embed], components: [row] });
    }

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
