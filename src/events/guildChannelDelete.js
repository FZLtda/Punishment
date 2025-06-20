const { AuditLogEvent } = require('discord.js');
const { monitorAction } = require('@modules/predictiveMonitor');
const { sendAlert } = require('@utils/sendAlert');

module.exports = {
  name: 'channelDelete',
  async execute(channel) {
    if (!channel.guild) return;

    const logs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelDelete,
      limit: 1
    }).catch(() => null);
    if (!logs) return;

    const entry = logs.entries.first();
    if (!entry) return;

    const { executor, createdTimestamp } = entry;

    const MAX_ENTRY_AGE = 5000;
    if (Date.now() - createdTimestamp > MAX_ENTRY_AGE) return;

    const trustedBots = ['1311761492147961908'];
    if (trustedBots.includes(executor.id)) return;

    const result = monitorAction(channel.guild.id, 'channelDelete', executor.id);

    if (result.flagged) {
      await sendAlert(channel.client, channel.guild, executor, 'Exclusão de Canais', result.count, result.timeWindow);
    }
  }
};
