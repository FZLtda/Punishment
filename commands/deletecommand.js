const axios = require('axios');

module.exports = {
  name: 'deletecommand',
  description: 'Remove um comando da API.',
  async execute(message, args) {
    const allowedUserId = '1006909671908585586';

    if (message.author.id !== allowedUserId) {
      return;
    }

    const commandName = args[0];

    if (!commandName) {
      return message.reply('<:emoji_33:1219788320234803250> Você precisa informar o nome do comando que deseja excluir.');
    }

    try {
      const response = await axios.delete('https://punishment.squareweb.app/api/commands', {
        data: { name: commandName },
      });

      if (response.status === 200) {
        message.reply(`<:emoji_33:1219788320234803250> O comando **"${commandName}"** foi removido com sucesso.`);
      }
    } catch (error) {
      console.error('Erro ao remover o comando:', error.message);

      if (error.response) {
        if (error.response.status === 404) {
          message.reply(`<:emoji_33:1219788320234803250> O comando **"${commandName}"** não foi encontrado.`);
        } else if (error.response.status === 400) {
          message.reply('<:emoji_33:1219788320234803250> Você precisa informar um nome válido para o comando.');
        } else {
          message.reply('<:emoji_33:1219788320234803250> Ocorreu um erro ao tentar remover o comando. Verifique os logs.');
        }
      } else {
        message.reply('<:emoji_33:1219788320234803250> Erro ao conectar com a API. Verifique se ela está funcionando.');
      }
    }
  },
};