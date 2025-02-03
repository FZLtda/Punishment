const axios = require('axios');

module.exports = {
  name: 'addcommand',
  description: 'Adiciona um comando à API do bot.',
  async execute(message, args) {
    const ownerId = '1006909671908585586';
    if (message.author.id !== ownerId) {
      return;
    }

    const [name, ...descriptionParts] = args;
    const description = descriptionParts.join(' ');

    if (!name || !description) {
      return message.reply('<:no:1122370713932795997> Você precisa informar o nome do comando.');
    }

    try {
      const response = await axios.post('https://punishment.squareweb.app/api/commands', {
        name,
        description,
      });

      if (response.status === 201) {
        return message.reply(`<:emoji_33:1219788320234803250> Comando **${name}** adicionado com sucesso.`);
      } else {
        return message.reply('<:no:1122370713932795997> Algo deu errado ao adicionar o comando.');
      }
    } catch (error) {
      console.error('Erro ao adicionar comando:', error.message);

      if (error.response) {
        if (error.response.status === 400) {
          return message.reply('<:no:1122370713932795997> Este comando já existe na API');
        } else {
          return message.reply('<:no:1122370713932795997> Erro na API. Verifique os logs.');
        }
      }

      return message.reply('<:no:1122370713932795997> Não foi possível conectar à API.');
    }
  },
};