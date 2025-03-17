const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Verifica se a interação é um comando de barra (Slash Command)
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        // Executa o comando de barra
        await command.execute(interaction);
      } catch (error) {
        console.error(`[ERROR] Erro ao executar Slash Command: ${error.message}`);
        // Responde ao usuário com um erro caso algo dê errado
        await interaction.reply({ content: '<:1000042883:1336044555354771638> Ocorreu um erro ao executar este comando.', ephemeral: true });
      }
    }

    // Verifica se a interação é um clique em botão
    if (interaction.isButton()) {
      // Verifica se o botão é de aceitação dos Termos de Uso
      if (interaction.customId === 'accept_terms') {
        const command = client.commands.get('acceptTerms');
        if (command) {
          // Executa o comando de aceitação dos Termos de Uso
          return await command.execute(interaction);
        }
        // Caso não encontre o comando, responde com erro
        return interaction.reply({ content: 'Erro ao processar os Termos de Uso.', ephemeral: true });
      }

      // Verifica se a interação está relacionada a um sorteio
      const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
      if (!giveaway) return;

      let participants = JSON.parse(giveaway.participants);

      // Verifica se o usuário clicou para participar do sorteio
      if (interaction.customId === 'participar') {
        // Verifica se o usuário já está participando
        if (participants.includes(interaction.user.id)) {
          return interaction.reply({ content: '<:1000042883:1336044555354771638> Você já está concorrendo neste sorteio!', ephemeral: true });
        }

        // Adiciona o usuário à lista de participantes
        participants.push(interaction.user.id);
        db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?').run(JSON.stringify(participants), interaction.message.id);

        // Atualiza os botões do sorteio
        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('participar').setLabel('🎟 Participar').setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ver_participantes')
            .setLabel(`👥 Participantes: ${participants.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

        // Responde ao usuário confirmando a participação e atualiza os botões
        await interaction.update({ components: [updatedRow] });
        return interaction.followUp({ content: '<:1000042885:1336044571125354496> Sua entrada no sorteio foi registrada!', ephemeral: true });
      }

      // Verifica se o usuário clicou para ver os participantes do sorteio
      if (interaction.customId === 'ver_participantes') {
        return interaction.reply({ content: `👥 Participantes: ${participants.length}`, ephemeral: true });
      }
    }
  },
};
