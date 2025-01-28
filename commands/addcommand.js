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
      return;
    }

    try {
      const response = await axios.post('https://punishment.squareweb.app/api/commands', {
        name,
        description,
      });

      if (response.status === 201) {
        message.author.send(`<:emoji_33:1219788320234803250> Comando **${name}** adicionado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao adicionar comando:', error.message);
    }
  },
};