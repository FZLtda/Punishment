const cache = new Map();
const flaggedRecently = new Map();

function monitorAction(guildId, type, executorId, limit = 5, timeWindow = 10000, cooldown = 15000) {
  const key = `${guildId}-${type}-${executorId}`;
  const now = Date.now();

  const timestamps = (cache.get(key) || []).filter(ts => now - ts < timeWindow);
  timestamps.push(now);
  cache.set(key, timestamps);

  const flagged = timestamps.length >= limit;
  const recentlyFlagged = flaggedRecently.get(key);
  const isOnCooldown = recentlyFlagged && now - recentlyFlagged < cooldown;

  if (flagged && !isOnCooldown) {
    flaggedRecently.set(key, now);
    return {
      flagged: true,
      count: timestamps.length,
      timeWindow: `${timeWindow / 1000}s`,
    };
  }

  return { flagged: false };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of cache) {
    const recent = timestamps.filter(ts => now - ts < 30000);
    if (recent.length) {
      cache.set(key, recent);
    } else {
      cache.delete(key);
    }
  }

  for (const [key, last] of flaggedRecently) {
    if (now - last > 30000) flaggedRecently.delete(key);
  }
}, 60 * 1000);

module.exports = { monitorAction };
