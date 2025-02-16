module.exports = {
    name: 'send',
    description: 'Envia uma mensagem para um canal específico.',
    async execute(message, args) {
      
      const prefix = await getPrefix(message.guild.id); 
  
      
      if (!message.content.startsWith(prefix)) return;
  

      if (!args.length) {
        return message.reply('Por favor, forneça um canal e uma mensagem.');
      }
  
      const channelMention = args[0];
      const channel = message.guild.channels.cache.get(channelMention.replace(/[<#>]/g, ''));
  
      const msgContent = args.slice(1).join(' ');
  
      if (!channel || !channel.isText()) {
        return message.reply('Canal inválido. Certifique-se de mencionar um canal de texto válido.');
      }
  
      if (!msgContent) {
        return message.reply('Por favor, forneça uma mensagem para enviar.');
      }
  
      try {
        await channel.send(msgContent);
        message.reply(`Mensagem enviada para ${channel}`);
      } catch (error) {
        console.error(error);
        message.reply('Houve um erro ao tentar enviar a mensagem.');
      }
    },
  };
  