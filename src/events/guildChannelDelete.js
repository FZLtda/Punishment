const { AuditLogEvent } = require('discord.js');
const { monitorAction } = require('../modules/predictiveMonitor');
const { sendAlert } = require('../utils/sendAlert');

module.exports = {
  name: 'channelDelete',
  async execute(channel) {
    if (!channel.guild) return;
    const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return;

    const { executor } = entry;
    const result = monitorAction(channel.guild.id, 'channelDelete', executor.id);
    if (result.flagged) {
      await sendAlert(channel.client, channel.guild, executor, 'Exclusão de Canais', result.count, result.timeWindow);
    }
  }
};
