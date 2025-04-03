const { generateEmbed } = require('../utils/generateEmbed');
const { generateButtons } = require('../utils/generateButtons');
const { handleHelpInteraction } = require('../handlers/interactionHandler');

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

      // Gera um identificador único para a interação
      const uniqueId = `help-${message.id}`;

      // Página inicial
      let currentPage = 1;
      const embedMessage = await message.channel.send({
        embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
        components: [generateButtons(currentPage, totalPages, uniqueId)],
      });

      // Passa o controle para o manipulador de interações
      handleHelpInteraction(embedMessage, message, commands, commandsPerPage, totalPages, uniqueId);
    } catch (error) {
      console.error('[ERROR] Falha ao executar o comando help:', error);
      return message.reply({
        content: '❌ Ocorreu um erro ao tentar exibir os comandos.',
        allowedMentions: { repliedUser: false },
      });
    }
  },
};