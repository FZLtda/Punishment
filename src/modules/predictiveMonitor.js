const cache = new Map();

function monitorAction(guildId, type, executorId, limit = 5, timeWindow = 10000) {
  const key = `${guildId}-${type}-${executorId}`;
  const now = Date.now();

  if (!cache.has(key)) cache.set(key, []);
  const timestamps = cache.get(key).filter(ts => now - ts < timeWindow);
  timestamps.push(now);
  cache.set(key, timestamps);

  if (timestamps.length >= limit) {
    return {
      flagged: true,
      count: timestamps.length,
      timeWindow: `${timeWindow / 1000}s`,
    };
  }

  return { flagged: false };
}

module.exports = { monitorAction };
