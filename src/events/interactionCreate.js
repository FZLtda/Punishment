const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`[ERROR] Erro ao executar Slash Command: ${error.message}`);
        await interaction.reply({ content: '<:1000042883:1336044555354771638> Ocorreu um erro ao executar este comando.', ephemeral: true });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'accept_terms') {
        const command = client.commands.get('acceptTerms');
        if (command) {
          return await command.execute(interaction);
        }
        return interaction.reply({ content: 'Erro ao processar os Termos de Uso.', ephemeral: true });
      }

      const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
      if (!giveaway) return;

      let participants = JSON.parse(giveaway.participants);

      if (interaction.customId === 'participar') {
        if (participants.includes(interaction.user.id)) {
          return interaction.reply({ content: '<:1000042883:1336044555354771638> Você já está concorrendo neste sorteio!', ephemeral: true });
        }

        participants.push(interaction.user.id);
        db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?').run(JSON.stringify(participants), interaction.message.id);

        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('participar').setLabel('🎟 Participar').setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ver_participantes')
            .setLabel(`👥 Participantes: ${participants.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

        await interaction.update({ components: [updatedRow] });
        return interaction.followUp({ content: '<:1000042885:1336044571125354496> Sua entrada no sorteio foi registrada!', ephemeral: true });
      }

      if (interaction.customId === 'ver_participantes') {
        return interaction.reply({ content: `👥 Participantes: ${participants.length}`, ephemeral: true });
      }
    }
  },

  //Teste - Func
    const forumChannelId = '1277353794874900520';
    const supportGuildId = '1006910950286299246';
    const supportGuild = client.guilds.cache.get(supportGuildId);

    if (!supportGuild) throw new Error('Servidor de suporte não encontrado.');

    const forumChannel = supportGuild.channels.cache.get(forumChannelId);

    if (!forumChannel || forumChannel.type !== 15) throw new Error('Canal de fórum não encontrado ou não é do tipo correto.');

    // Lidar com a interação do botão
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

    // Lidar com a submissão do modal
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
        reason: `Problema reportado por ${interaction.user.tag}`,
      });

      await interaction.reply({
        content: `<:1000042885:1336044571125354496> Problema reportado com sucesso no servidor de suporte principal. Obrigado por nos avisar!`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Erro ao lidar com interação:', error);
    await interaction.reply({
      content: 'Houve um erro ao processar seu reporte. Tente novamente mais tarde.',
      ephemeral: true,
    });
  }
};
