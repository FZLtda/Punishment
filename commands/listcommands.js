const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listcommands',
  description: 'Lista os comandos disponíveis na API.',
  async execute(message) {
    const ownerId = '1006909671908585586';
    if (message.author.id !== ownerId) {
      return;
    }

    try {
      const response = await axios.get('https://punishment.squareweb.app/api/commands');

      if (response.status === 200 && response.data.length > 0) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('Comandos Disponíveis')
          .setDescription('Aqui está a lista de comandos adicionados na API:')
          .setFooter({ text: 'Lista gerada com sucesso!' });

        response.data.forEach((command) => {
          embed.addFields({ name: command.name, value: command.description, inline: false });
        });

        return message.reply({ embeds: [embed] });
      } else {
        return message.reply('<:no:1122370713932795997> Não há comandos disponíveis na API.');
      }
    } catch (error) {
      console.error('Erro ao buscar comandos:', error.message);

      return message.reply('<:no:1122370713932795997> Não foi possível conectar à API para buscar os comandos.');
    }
  },
};