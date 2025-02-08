const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'undo',
  description: 'Desfaz o último comando executado.',
  usage: '${currentPrefix}undo [quantidade (1-5)]',
  permissions: 'Gerenciar Mensagens',
  execute: async (message, args) => {
    try {
      
      if (!message.guild.members.me.permissions.has('MANAGE_MESSAGES')) {
        const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
            name: 'Você não possui permissão para usar este comando.',
            iconURL: 'http://bit.ly/4aIyY9j'
        });
  
    return message.reply({ embeds: [embedErroMinimo] });
      }

     
      let amount = parseInt(args[0]) || 1;
      if (isNaN(amount) || amount < 1 || amount > 5) {
        const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Forneça uma quantidade válida entre 1 e 5.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
      }

      
      const messages = await message.channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(
        (msg) => msg.author.id === message.client.user.id && !msg.pinned
      );

     
      const messagesToDelete = botMessages.first(amount);

      
      if (!messagesToDelete.length) {
        const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não encontrei mensagens recentes do bot para excluir.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
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
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível desfazer a mensagem devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};
