const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');

module.exports = {
  name: 'warn',
  description: 'Adiciona um aviso a um usuário no servidor.',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const user = message.mentions.members.first();
    if (!user) {
      return message.reply({
        content: `${attent} Você precisa mencionar um usuário para avisar.`,
        allowedMentions: { repliedUser: false },
      });
    }

    const reason = args.slice(1).join(' ') || 'Nenhum motivo especificado';

    const embed = new EmbedBuilder()
      .setColor(yellow)
      .setTitle(`${attent} Usuário avisado`)
      .setDescription(
        `${user} (\`${user.id}\`) recebeu um aviso.\n\n**Motivo:** ${reason}`
      )
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};