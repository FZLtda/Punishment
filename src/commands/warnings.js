const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');

module.exports = {
  name: 'warnings',
  description: 'Exibe todos os avisos registrados de um membro.',
  usage: '${currentPrefix}warnings <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    try {
      const target = message.mentions.members.first();

      if (!target) {
        return sendEmbed(message, {
          color: yellow,
          author: {
            name: 'Você deve mencionar um usuário para ver os avisos.',
            iconURL: icon_attention,
          },
        });
      }

      const warnings = db
        .prepare('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?')
        .all(target.id, message.guild.id);

      if (!warnings.length) {
        return sendEmbed(message, {
          color: yellow,
          title: 'Nenhum Aviso Encontrado',
          description: `${target} não possui avisos registrados.`,
          footer: {
            text: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          },
          timestamp: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle(`${attent} Registro de Advertências — ${target.user.displayName}`)
        .setDescription(warnings.map((warn, i) => {
          return `**#${i + 1}**\n` +
                 `**Motivo:** ${warn.reason || 'Não informado'}\n` +
                 `**Moderador:** <@${warn.moderator_id}>\n` +
                 `**Data:** <t:${Math.floor(warn.timestamp / 1000)}:F>`;
        }).join('\n\n'))
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (err) {
      console.error('[Punishment] Erro ao buscar avisos:', err);

      return sendEmbed(message, {
        color: yellow,
        author: {
          name: 'Ocorreu um erro ao tentar obter os avisos.',
          iconURL: icon_attention,
        },
      });
    }
  },
};

function sendEmbed(message, { color, title, description, author, footer, timestamp = false }) {
  const embed = new EmbedBuilder().setColor(color);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (author) embed.setAuthor(author);
  if (footer) embed.setFooter(footer);
  if (timestamp) embed.setTimestamp();

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false },
  });
}
