const { EmbedBuilder } = require('discord.js');
const { yellow, red } = require('../config/colors.json');
const { check, icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem para qualquer canal com a opção de ser em embed ou texto simples.',
  usage: '${currentPrefix}send <canal> <embed|texto> <mensagem>',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  execute: async (message, args) => {
    try {    

      if (args.length < 3) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Uso correto: `.send <canal> <embed|texto> <mensagem>',
            iconURL: icon_attention
          });
  
        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
          
      }

      const channelMention = args[0];
      const channel = message.guild.channels.cache.get(channelMention.replace(/[<#>]/g, '')) || message.guild.channels.cache.find(c => c.name === channelMention);

      if (!channel || !channel.isTextBased()) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Canal inválido ou não encontrado.',
            iconURL: icon_attention
          });
  
        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } }); 
      }

      const messageType = args[1].toLowerCase();
      const content = args.slice(2).join(' ');

      if (messageType === 'embed') {

        const embed = new EmbedBuilder()
          .setColor(red)
          .setDescription(content)
          .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      } else if (messageType === 'texto') {

        await channel.send(content);
      } else {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Tipo de mensagem inválido. Use `embed` ou `texto`.',
            iconURL: icon_attention
          });
  
        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
          
      }

      return message.reply({
        content: `${check} Mensagem enviada com sucesso no canal ${channel}.`,
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível enviar a mensagem devido a um erro.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
