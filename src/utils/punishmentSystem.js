const { EmbedBuilder } = require('discord.js');
const { colors, emojis, settings } = require('@config');
const fs = require('fs');
const path = require('path');

const warnChannelPath = path.join(__dirname, '..', 'data', 'warnChannels.json');

async function applyPunishment(client, guild, user, warningsCount, moderatorId) {
  const punishment = settings.warnPunishments.find(p => p.count === warningsCount);
  if (!punishment) return;

  const member = await guild.members.fetch(user).catch(() => null);
  if (!member) return;

  let action = '';
  let tempoPunicao = '';
  let motivo = 'Punição automática por excesso de avisos';

  try {
    switch (punishment.action) {
      case 'timeout':
        await member.timeout(punishment.duration, motivo);
        action = 'Timeout';
        tempoPunicao = formatDuration(punishment.duration);
        break;
      case 'kick':
        await member.kick(motivo);
        action = 'Expulsão';
        break;
      case 'ban':
        await member.ban({ reason: motivo });
        action = 'Banimento';
        break;
    }

    const embed = new EmbedBuilder()
      .setTitle('<:Mutado:1355700779859574954> Punição aplicada')
      .setColor(colors.red)
      .setDescription(`${member} (\`${member.id}\`) recebeu uma punição automática!`)
      .addFields(
        { name: 'Ação', value: `\`${action}\``, inline: true },
        ...(tempoPunicao ? [{ name: 'Duração', value: `\`${tempoPunicao}\``, inline: true }] : []),
        { name: 'Motivo', value: `\`${motivo}\`` },
        { name: 'Avisos', value: `\`${warningsCount}\``, inline: true },
        { name: 'Moderador original', value: `<@${moderatorId}>`, inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: guild.name, iconURL: guild.iconURL() })
      .setTimestamp();

    const logChannel = guild.channels.cache.get(settings.logChannelId);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }

    if (fs.existsSync(warnChannelPath)) {
      const data = JSON.parse(fs.readFileSync(warnChannelPath, 'utf8'));
      const lastWarnChannelId = data[guild.id];

      if (lastWarnChannelId) {
        const lastWarnChannel = guild.channels.cache.get(lastWarnChannelId);
        if (lastWarnChannel?.isTextBased()) {
          await lastWarnChannel.send({ embeds: [embed] });
        }
      }
    }

  } catch (err) {
    console.error('[Punishment] Erro ao aplicar punição automática:', err);
  }
}

function formatDuration(ms) {
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor((ms / (1000 * 60)) % 60);
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);

  return parts.join(' ');
}

module.exports = { applyPunishment };
