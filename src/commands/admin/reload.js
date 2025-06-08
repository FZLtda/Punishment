const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reload',
  description: 'Recarrega um comando específico do bot.',
  usage: '${currentPrefix}reload <comando>',
  ownerOnly: true,

  async execute(message, args, client) {
    const commandName = args[0]?.toLowerCase();
    if (!commandName) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: 'Você precisa especificar um comando para recarregar.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const command = client.commands.get(commandName);
    if (!command) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: `O comando "${commandName}" não foi encontrado.`, iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const commandPath = require.resolve(path.join(__dirname, `${command.name}.js`));
    delete require.cache[commandPath];
    
    try {
      const newCommand = require(commandPath);
      client.commands.set(newCommand.name, newCommand);

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('Green')
          .setAuthor({ name: `Comando "${newCommand.name}" recarregado com sucesso!`, iconURL: 'https://bit.ly/43PItSI' })
        ],
        allowedMentions: { repliedUser: false }
      });

    } catch (error) {
      console.error(error);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({ name: 'Ocorreu um erro ao recarregar o comando.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
