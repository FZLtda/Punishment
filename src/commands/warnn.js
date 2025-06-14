const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');
const { logChannelId } = require('../config/settings.json');
const { buildEmbed } = require('../utils/embedUtils');
const { applyPunishment } = require('../utils/punishmentSystem');

module.exports = {
  name: 'warnn',
  description: 'Adiciona um aviso a um membro.',
  usage: '${currentPrefix}warn <@usuário> [motivo]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [buildEmbed({
          color: yellow,
          author: { name: 'Você precisa mencionar um usuário para aplicar o aviso.', iconURL: icon_attention }
        })],
        allowedMentions: { repliedUser: false }
      });

    if (target.user.bot || target.id === message.author.id)
      return message.channel.send({
        embeds: [buildEmbed({
          color: yellow,
          author: { name: 'Não é possível avisar bots ou a si mesmo.', iconURL: icon_attention }
        })],
        allowedMentions: { repliedUser: false }
      });

    const reason = args.slice(1).join(' ') || 'Motivo não especificado';

    db.prepare(`
      INSERT INTO warnings (user_id, guild_id, reason, moderator_id, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(target.id, message.guild.id, reason, message.author.id, Date.now());

    const totalWarnings = db
      .prepare(`SELECT COUNT(*) AS count FROM warnings WHERE user_id = ? AND guild_id = ?`)
      .get(target.id, message.guild.id).count;

    const embed = buildEmbed({
      color: yellow,
      title: `${attent} Aviso Aplicado`,
      description: `${target} (\`${target.id}\`) recebeu um aviso.\n\n**Motivo:** ${reason}`,
      footer: { text: `Moderador: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    });

    await message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = buildEmbed({
        color: yellow,
        title: `📋 Novo Aviso`,
        description: `**Usuário:** ${target} (\`${target.id}\`)\n**Moderador:** ${message.author} (\`${message.author.id}\`)\n**Motivo:** ${reason}`,
        footer: { text: `Total de avisos: ${totalWarnings}`, iconURL: message.guild.iconURL() },
      });

      await logChannel.send({ embeds: [logEmbed] });
    }

    await applyPunishment(message.client, message.guild, target.id, totalWarnings, message.author.id);
  }
};
