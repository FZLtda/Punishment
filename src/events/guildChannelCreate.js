const { AuditLogEvent } = require('discord.js');
const { monitorAction } = require('../modules/predictiveMonitor');
const { sendAlert } = require('../utils/sendAlert');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (!channel.guild) return;
    const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return;

    const { executor } = entry;
    const result = monitorAction(channel.guild.id, 'channelCreate', executor.id);
    if (result.flagged) {
      await sendAlert(channel.client, channel.guild, executor, 'Criação de Canais', result.count, result.timeWindow);
    }
  }
};
