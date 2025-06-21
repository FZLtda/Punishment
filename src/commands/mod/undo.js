const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'undo',
  description: 'Desfaz o último comando executado.',
  usage: '${currentPrefix}undo [quantidade (1-5)]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,
  
  execute: async (message, args) => {
    try {
      
      let amount = parseInt(args[0]) || 1;
      if (isNaN(amount) || amount < 1 || amount > 5) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Forneça uma quantidade válida entre 1 e 5.',
            iconURL: emojis.icon_attention
          });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      
      const messages = await message.channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(
        (msg) => msg.author.id === message.client.user.id && !msg.pinned
      );

     
      const messagesToDelete = botMessages.first(amount);

      
      if (!messagesToDelete.length) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Não encontrei mensagens recentes do bot para excluir.',
            iconURL: emojis.icon_attention
          });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

     
      if (messagesToDelete.length === 1) {
        await messagesToDelete[0].delete();
      } else {
        await message.channel.bulkDelete(messagesToDelete);
      }

      
      if (message.deletable) {
        await message.delete();
      }
    } catch (error) {
      console.error('[ERROR] Erro ao executar o comando "undo":', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível desfazer a mensagem devido a um erro.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
