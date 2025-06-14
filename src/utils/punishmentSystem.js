const { warnPunishments, logChannelId } = require('../config/settings.json');
const { buildEmbed } = require('../embedUtils');
const { yellow } = require('../config/colors.json');

async function applyPunishment(client, guild, user, warningsCount, moderator) {
  const punishment = warnPunishments.find(p => p.count === warningsCount);
  if (!punishment) return;

  const member = await guild.members.fetch(user).catch(() => null);
  if (!member) return;

  let action = '';
  try {
    switch (punishment.action) {
      case 'timeout':
        await member.timeout(punishment.duration, 'Punição automática por avisos');
        action = `Timeout de ${punishment.duration / 1000}s`;
        break;
      case 'kick':
        await member.kick('Punição automática por avisos');
        action = 'Expulso';
        break;
      case 'ban':
        await member.ban({ reason: 'Punição automática por avisos' });
        action = 'Banido';
        break;
    }

    const logChannel = guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = buildEmbed({
        color: yellow,
        title: '⚠️ Punição Automática Aplicada',
        description: `**Usuário:** <@${user}> (\`${user}\`)\n**Avisos:** ${warningsCount}\n**Ação:** ${action}\n**Moderador Original:** <@${moderator}>`,
        footer: { text: guild.name, iconURL: guild.iconURL() }
      });

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (err) {
    console.error('[Punishment] Erro ao aplicar punição automática:', err);
  }
}

module.exports = { applyPunishment };
