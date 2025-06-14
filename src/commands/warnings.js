const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');

module.exports = {
  name: 'warnings',
  description: 'Lista os avisos de um usuário no servidor.',
  usage: '${currentPrefix}warnings <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    try {
      const user = message.mentions.members.first();

      if (!user) {
        const embedErro = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Mencione um usuário para visualizar os avisos.',
            iconURL: icon_attention,
          });

        return message.channel.send({
          embeds: [embedErro],
          allowedMentions: { repliedUser: false },
        });
      }

      const warnings = db
        .prepare('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?')
        .all(user.id, message.guild.id);

      if (!warnings || warnings.length === 0) {
        const embedSemAvisos = new EmbedBuilder()
          .setColor(yellow)
          .setTitle('Sem Avisos')
          .setDescription(`${user} não possui nenhum aviso registrado.`)
          .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp();

        return message.channel.send({
          embeds: [embedSemAvisos],
          allowedMentions: { repliedUser: false },
        });
      }

      const embedAvisos = new EmbedBuilder()
        .setColor(yellow)
        .setTitle(`${attent} Registro de Advertências — ${user.displayName}`)
        .setDescription(
          warnings
            .map(
              (warn, index) =>
                `**#${index + 1}**\n` +
                `**Motivo:** ${warn.reason}\n` +
                `**Moderador:** <@${warn.moderator_id}>\n` +
                `**Data:** <t:${Math.floor(warn.timestamp / 1000)}:F>`
            )
            .join('\n\n')
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({
        embeds: [embedAvisos],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error('[Erro ao buscar avisos]:', error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Ocorreu um erro ao buscar os avisos.',
          iconURL: icon_attention,
        });

      return message.channel.send({
        embeds: [embedErro],
        allowedMentions: { repliedUser: false },
      });
    }
  },
};
