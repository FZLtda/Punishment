const { generateEmbed } = require('../utils/generateEmbed');
const { generateButtons } = require('../utils/generateButtons');
const { ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'test',
  description: 'Exibe todos os comandos disponíveis e suas informações.',
  usage: '${currentPrefix}help',
  permissions: 'Enviar Mensagens',
  execute: async (message) => {
    try {
      const commands = message.client.commands;
      const commandsPerPage = 10; // Número de comandos por página
      const totalPages = Math.ceil(commands.size / commandsPerPage);

      // Gera um identificador único para os botões (baseado no ID do autor)
      const uniqueId = `help-${message.author.id}`;

      // Página inicial
      let currentPage = 1;
      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
        components: [generateButtons(currentPage, totalPages, uniqueId)],
      });

      // Criar um coletor de interações para os botões
      const collector = embedMessage.createMessageComponentCollector({
        filter: (interaction) => {
          if (interaction.user.id !== message.author.id) {
            interaction.reply({
              content: '❌ Apenas o autor do comando pode usar esses botões.',
              ephemeral: true,
            });
            return false;
          }
          return interaction.customId.startsWith(uniqueId); // Garante que o botão pertence a esta instância
        },
        time: 60000, // 1 minuto
      });

      collector.on('collect', async (interaction) => {
        const action = interaction.customId.split('-')[2]; // Obtém a ação (first, previous, next, last)

        if (action === 'first') currentPage = 1;
        if (action === 'previous') currentPage--;
        if (action === 'next') currentPage++;
        if (action === 'last') currentPage = totalPages;

        await interaction.update({
          embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
          components: [generateButtons(currentPage, totalPages, uniqueId)],
        });
      });

      collector.on('end', () => {
        embedMessage.edit({
          components: [
            new ActionRowBuilder().addComponents(
              generateButtons(currentPage, totalPages, uniqueId).components.map((button) =>
                button.setDisabled(true)
              )
            ),
          ],
        });
      });
    } catch (error) {
      console.error('[ERROR] Falha ao executar o comando help:', error);
      return message.reply({
        content: '❌ Ocorreu um erro ao tentar exibir os comandos.',
        allowedMentions: { repliedUser: false },
      });
    }
  },
};