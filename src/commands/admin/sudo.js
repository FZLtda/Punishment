const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'sudo',
  description: 'Executa um comando como se fosse outro usuário (admin only).',
  usage: '${currentPrefix}sudo <@usuário> <comando>',
  ownerOnly: true,

  async execute(message, args, client) {
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: 'Mencione um usuário válido.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const commandInput = args.slice(1).join(' ');
    if (!commandInput) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: 'Você precisa informar o comando que deseja executar como esse usuário.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const fakeMessage = Object.create(message);
    fakeMessage.author = user;
    fakeMessage.member = await message.guild.members.fetch(user.id);
    fakeMessage.content = commandInput;
    fakeMessage.channel = message.channel;

    const argsParsed = commandInput.trim().split(/\s+/);
    const cmdName = argsParsed[0].toLowerCase();
    const cmdArgs = argsParsed.slice(1);
    const command = client.commands.get(cmdName);

    if (!command) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: `O comando "${cmdName}" não foi encontrado.`, iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      await command.execute(fakeMessage, cmdArgs, client);
      return message.react('<:sucesso:1358918549846098201>');
    } catch (error) {
      console.error(error);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({ name: 'Erro ao executar o comando como outro usuário.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
