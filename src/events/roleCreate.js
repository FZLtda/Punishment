const { AuditLogEvent } = require('discord.js');
const { monitorAction } = require('../modules/predictiveMonitor');
const { sendAlert } = require('../utils/sendAlert');

module.exports = {
  name: 'roleCreate',
  async execute(role) {
    if (!role.guild) return;
    const logs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return;

    const { executor } = entry;
    const result = monitorAction(role.guild.id, 'roleCreate', executor.id);
    if (result.flagged) {
      await sendAlert(role.client, role.guild, executor, 'Criação de Cargos', result.count, result.timeWindow);
    }
  }
};
