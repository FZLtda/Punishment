const { AuditLogEvent, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'guildAuditLogEntryCreate',
  async execute(entry, client) {
    const { guild, action, executor } = entry;
    if (!guild) return;

    const path = './data/antinuke.json';
    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!settings[guild.id]?.enabled) return;

    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (!member) return;

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    let actionName = '';
    switch (action) {
      case AuditLogEvent.ChannelDelete:
        actionName = 'Exclusão de Canal';
        break;
      case AuditLogEvent.MemberBanAdd:
        actionName = 'Banimento de Usuário';
        break;
      case AuditLogEvent.RoleDelete:
        actionName = 'Exclusão de Cargo';
        break;
      case AuditLogEvent.WebhookDelete:
        actionName = 'Exclusão de Webhook';
        break;
      default:
        return;
    }

    try {
      await member.timeout(10 * 60 * 1000, `Detecção de ${actionName} pelo Anti-Nuke`);
      await guild.channels.cache.first()?.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FE3838')
            .setTitle('🚨 Tentativa de Nuke Bloqueada')
            .setDescription(`O usuário **${executor.tag}** tentou realizar **${actionName}** e foi punido automaticamente.`)
            .setFooter({ text: 'Sistema Anti-Nuke', iconURL: client.user.displayAvatarURL() })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error('Erro ao aplicar punição no Anti-Nuke:', error);
    }
  },
};
