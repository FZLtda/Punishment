const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'reload',
  description: 'Recarrega um comando sem reiniciar o bot.',
  usage: '${currentPrefix}reload <nome do comando>',
  userPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message, args) {

    if (message.author.id !== '1006909671908585586') return;
    
    const commandName = args[0];
    if (!commandName) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa fornecer o nome do comando para recarregar.',
          iconURL: icon_attention
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const command =
      message.client.commands.get(commandName) ||
      message.client.commands.find((cmd) => cmd.name === commandName);

    if (!command) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: `O comando "${commandName}" não foi encontrado.`,
          iconURL: icon_attention
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      
      const commandFolders = path.join(__dirname, '..');
      const commandPath = path.join(commandFolders, `${command.category || 'admin'}/${command.name}.js`);

      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);

      message.client.commands.set(newCommand.name, newCommand);

      const embedSuccess = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({
          name: `O comando "${newCommand.name}" foi recarregado com sucesso!`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        });

      return message.reply({ embeds: [embedSuccess], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: `Erro ao recarregar o comando "${commandName}".`,
          iconURL: icon_attention
        })
        .setFooter({ text: error.message });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
