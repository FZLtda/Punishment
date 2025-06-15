const { EmbedBuilder } = require('discord.js');
const db = require('../../data/database');
const { yellow } = require('../../config/colors.json');
const { icon_attention, attent } = require('../../config/emoji.json');
const { logChannelId } = require('../../config/settings.json');
const { applyPunishment } = require('../../utils/punishmentSystem');
const { saveWarnChannel } = require('../../utils/warnChannelTracker');

module.exports = {
  name: 'warn',
  description: 'Adiciona um aviso a um membro.',
  usage: '${currentPrefix}warn <@usuário> [motivo]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    if (this.deleteMessage) message.delete().catch(() => {});

    const target = message.mentions.members.first();

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa mencionar um usuário para aplicar o aviso.',
          iconURL: icon_attention,
        });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    if (target.user.bot || target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não é possível avisar bots ou a si mesmo.',
          iconURL: icon_attention,
        });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const reason = args.slice(1).join(' ') || 'Motivo não especificado';

    saveWarnChannel(message.guild.id, message.channel.id);

    db.prepare(
      `INSERT INTO warnings (user_id, guild_id, reason, moderator_id, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    ).run(target.id, message.guild.id, reason, message.author.id, Date.now());

    const totalWarnings = db
      .prepare(`SELECT COUNT(*) AS count FROM warnings WHERE user_id = ? AND guild_id = ?`)
      .get(target.id, message.guild.id).count;

    const embed = new EmbedBuilder()
      .setColor(yellow)
      .setTitle(`${attent} Aviso Aplicado`)
      .setDescription(`${target} (\`${target.id}\`) recebeu um aviso.\n\n**Motivo:** ${reason}`)
      .setFooter({
        text: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await message.channel.send({
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle(`${attent} Advertência`)
        .setDescription(
          `**Usuário:** ${target} (\`${target.id}\`)\n` +
          `**Moderador:** ${message.author} (\`${message.author.id}\`)\n` +
          `**Motivo:** ${reason}`
        )
        .setFooter({
          text: `Total de avisos: ${totalWarnings}`,
          iconURL: message.guild.iconURL(),
        })
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    }

    await applyPunishment(
      message.client,
      message.guild,
      target.id,
      totalWarnings,
      message.author.id
    );
  },
};
