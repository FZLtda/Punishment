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
      return message.reply('<:no:1122370713932795997> Você precisa informar o nome do comando.');
    }

    try {
      console.log(`Tentando remover o comando: ${commandName}`);

      const response = await axios.delete(`https://punishment.squareweb.app/api/commands/${commandName}`);

      if (response.status === 200) {
        message.reply(`<:emoji_33:1219788320234803250> Comando **"${commandName}"** foi removido com sucesso.`);
      }
    } catch (error) {
      console.error('Erro ao remover o comando:', error.message);

      if (error.response) {
        if (error.response.status === 404) {
          message.reply(`<:no:1122370713932795997> Este comando não existe na API.`);
        } else {
          message.reply('<:no:1122370713932795997> Não foi possível remover o comando.');
        }
      } else {
        message.reply('<:no:1122370713932795997> Erro ao conectar com a API. Verifique se ela está funcionando.');
      }
    }
  },
};