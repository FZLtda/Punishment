const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/sorteios');

module.exports = {
  name: 'sorteio',
  description: 'Inicia um sorteio no servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para iniciar sorteios.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    const premio = args.join(' ');
    if (!premio) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa especificar um prêmio para o sorteio.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    const sorteioId = `sorteio-${Date.now()}`;
    db[sorteioId] = {
      premio,
      participantes: [],
    };

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 Novo Sorteio!')
      .setDescription(`🎁 **Prêmio:** ${premio}\n🎟️ Clique no botão para participar do sorteio!`)
      .setFooter({ text: `ID do Sorteio: ${sorteioId}` })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`participar-${sorteioId}`)
          .setLabel('Participar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`ver-participantes-${sorteioId}`)
          .setLabel('0 Participantes')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );

    const sorteioMessage = await message.reply({ embeds: [embed], components: [row] });

    const collector = sorteioMessage.createMessageComponentCollector({ time: 24 * 60 * 60 * 1000 });

    collector.on('collect', async (interaction) => {
      if (!interaction.isButton()) return;

      const [action, id] = interaction.customId.split('-');

      // Verifica se o sorteio existe
      if (!db[id]) {
        return interaction.reply({
          content: 'Sorteio não encontrado. Pode ter sido finalizado.',
          ephemeral: true,
        });
      }

      if (action === 'participar') {
        const participantes = db[id].participantes;

        if (participantes.includes(interaction.user.id)) {
          return interaction.reply({
            content: 'Você já está participando deste sorteio!',
            ephemeral: true,
          });
        }

        participantes.push(interaction.user.id);

        const updatedRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`participar-${id}`)
              .setLabel('Participar')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`ver-participantes-${id}`)
              .setLabel(`${participantes.length} Participantes`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
          );

        await sorteioMessage.edit({ components: [updatedRow] });

        return interaction.reply({
          content: 'Você entrou no sorteio com sucesso!',
          ephemeral: true,
        });
      }
    });
  },
};