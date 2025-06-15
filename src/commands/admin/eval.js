const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'eval',
  description: 'Executa código JavaScript diretamente (restrito ao dono).',
  usage: '${currentPrefix}eval <código>',
  ownerOnly: true,

  async execute(message, args) {

    if (message.author.id !== '1006909671908585586') return;
    
    const code = args.join(' ');
    if (!code) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({ name: 'Insira o código para ser avaliado.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      let result = await eval(code);
      if (typeof result !== 'string') result = require('util').inspect(result, { depth: 0 });

      if (result.length > 1900) result = result.slice(0, 1900) + '...';

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('Green')
          .setDescription(`\`\`\`js\n${result}\n\`\`\``)
        ],
        allowedMentions: { repliedUser: false }
      });

    } catch (err) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`\`\`\`js\n${err}\n\`\`\``)
        ],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
