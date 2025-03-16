client.once('ready', () => {
  client.user.setPresence({
    activities: [{
      name: `.help  •  Punishment`,
      type: 0,
      emoji: { name: '🔨' }
    }],
    status: 'online',
  });
});

module.exports = { setPresence };


