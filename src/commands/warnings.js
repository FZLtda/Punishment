const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const db = require('../../data/database');
const startWarningsPagination = require('../../components/warningsPagination');

module.exports = {
  name: 'warnings',
  description: 'Lista os avisos de um usuário no servidor.',
  usage: '${currentPrefix}warnings <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    const user = message.mentions.members.first();

    if (!user) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Mencione um usuário para visualizar os avisos.',
          iconURL: icon_attention,
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const warnings = db
      .prepare('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?')
      .all(user.id, message.guild.id);

    if (!warnings || warnings.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle('Sem Avisos')
        .setDescription(`${user} não possui nenhum aviso registrado.`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    startWarningsPagination(message, user, warnings);
  },
};
