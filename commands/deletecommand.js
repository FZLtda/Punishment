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
      const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Você precisa informar o nome do comando.',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo] });
    }

    try {
      console.log(`Tentando remover o comando: ${commandName}`);

      const response = await axios.delete(`https://punishment.squareweb.app/api/commands/${commandName}`);

      if (response.status === 200) {
        message.reply(`<:emoji_33:1219788320234803250> Comando **${commandName}** foi removido com sucesso.`);
      }
    } catch (error) {
      console.error('Erro ao remover o comando:', error.message);

      if (error.response) {
        if (error.response.status === 404) {
          const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Este comando não existe na API.',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo] });
        } else {
          const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Não foi possível remover o comando.',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo] });
        }
      } else {
        const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Não foi possível estabelecer conexão com a API.',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo] });
      }
    }
  },
};
