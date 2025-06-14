const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');

module.exports = {
  name: 'warn',
  description: 'Adiciona um aviso a um usuário no servidor.',
  usage: '${currentPrefix}warn <@usuário> [motivo]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    try {
      const user = message.mentions.members.first();

      if (!user) {
        const embedErro = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Você precisa mencionar um usuário para avisar.',
            iconURL: icon_attention,
          });

        return message.reply({
          embeds: [embedErro],
          allowedMentions: { repliedUser: false },
        });
      }

      if (user.user.bot) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(yellow)
              .setAuthor({
                name: 'Você não pode avisar um bot.',
                iconURL: icon_attention,
              }),
          ],
          allowedMentions: { repliedUser: false },
        });
      }

      if (user.id === message.author.id) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(yellow)
              .setAuthor({
                name: 'Você não pode se autoavisar.',
                iconURL: icon_attention,
              }),
          ],
          allowedMentions: { repliedUser: false },
        });
      }

      const reason = args.slice(1).join(' ') || 'Nenhum motivo especificado';

      db.prepare(`
        INSERT INTO warnings (user_id, guild_id, reason, moderator_id, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(user.id, message.guild.id, reason, message.author.id, Date.now());

      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle(`${attent} Usuário avisado`)
        .setDescription(
          `${user} (\`${user.id}\`) recebeu um aviso.\n\n**Motivo:** ${reason}`
        )
        .setFooter({
          text: `Avisado por ${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[Erro ao aplicar warn]:', error);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({
              name: 'Erro ao adicionar o aviso. Tente novamente mais tarde.',
              iconURL: icon_attention,
            }),
        ],
        allowedMentions: { repliedUser: false },
      });
    }
  },
};
