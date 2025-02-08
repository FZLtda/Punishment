const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Colors,
} = require('discord.js');

module.exports = {
  name: 'report',
  description: 'Reporte um problema enviando informações para o servidor de suporte principal.',
  usage: '${currentPrefix}report',
  permissions: 'Enviar Mensagens',
  async execute(message) {
    try {
      const forumChannelId = '1277353794874900520';
      const supportGuildId = '1006910950286299246';
      const supportGuild = message.client.guilds.cache.get(supportGuildId);

      if (!supportGuild) {
        return;
      }

      const forumChannel = supportGuild.channels.cache.get(forumChannelId);

      if (!forumChannel || forumChannel.type !== 15) {
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('Reporte de Problemas')
        .setDescription(
          'Clique no botão abaixo para reportar um problema. Suas informações serão enviadas para o canal de suporte.'
        )
        .setColor(Colors.Red);

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open-report-modal')
          .setLabel('Reportar Problema')
          .setStyle('Danger')
      );

      await message.reply({ embeds: [embed], components: [buttonRow] });

      message.client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton() && interaction.customId === 'open-report-modal') {
          const modal = new ModalBuilder()
            .setCustomId('report-modal')
            .setTitle('Reporte de Problema');

          const titleInput = new TextInputBuilder()
            .setCustomId('problem-title')
            .setLabel('Título do Problema')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Exemplo: Erro ao executar comando')
            .setRequired(true);

          const descriptionInput = new TextInputBuilder()
            .setCustomId('problem-description')
            .setLabel('Descrição do Problema')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Explique o que aconteceu e como reproduzir o problema.')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput)
          );

          await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'report-modal') {
          const problemTitle = interaction.fields.getTextInputValue('problem-title');
          const problemDescription = interaction.fields.getTextInputValue('problem-description');

          const threadEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(problemTitle)
            .setDescription(problemDescription)
            .setFooter({ text: `Reportado por ${interaction.user.tag} de ${interaction.guild.name}` })
            .setTimestamp();

          const thread = await forumChannel.threads.create({
            name: problemTitle,
            autoArchiveDuration: 1440,
            message: {
              embeds: [threadEmbed],
            },
            reason: `Problema reportado por ${interaction.user.tag} do servidor ${interaction.guild.name}`,
          });

          await interaction.reply({
            content: `<:emoji_33:1219788320234803250> Problema reportado com sucesso no servidor de suporte principal. Obrigado por nos avisar!`,
            ephemeral: true,
          });
        }
      });
    } catch (error) {
      console.error(`<:no:1122370713932795997> Erro ao executar o comando report: ${error.message}`);
      const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Não conseguimos processar seu reporte.',
                    iconURL: 'http://bit.ly/4aIyY9j'
                });

            return message.reply({ embeds: [embedErro] });
    }
  },
};
