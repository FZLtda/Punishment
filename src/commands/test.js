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

      // Página inicial
      let currentPage = 1;
      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
        components: [generateButtons(currentPage, totalPages)],
      });

      // Criar um coletor de interações para os botões
      const collector = embedMessage.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 60000, // 1 minuto
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'first') currentPage = 1;
        if (interaction.customId === 'previous') currentPage--;
        if (interaction.customId === 'next') currentPage++;
        if (interaction.customId === 'last') currentPage = totalPages;

        await interaction.update({
          embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
          components: [generateButtons(currentPage, totalPages)],
        });
      });

      collector.on('end', () => {
        embedMessage.edit({
          components: [
            new ActionRowBuilder().addComponents(
              generateButtons(currentPage, totalPages).components.map((button) =>
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