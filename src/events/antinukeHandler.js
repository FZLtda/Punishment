const { AuditLogEvent, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
  client.on('guildAuditLogEntryCreate', async (entry) => {
    const { guild, targetType, action, executor } = entry;
    if (!guild) return;

    // Verifica se o Anti-Nuke está ativado
    const fs = require('fs');
    const path = './data/antinuke.json';
    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!settings[guild.id]?.enabled) return;

    // Obtém o executor
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (!member) return;

    // Verifica se o usuário tem permissão
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

    // Punição automática: remover permissões ou banir
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
  });
};
