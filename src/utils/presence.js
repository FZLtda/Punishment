function setPresence(client) {
  client.on('ready', () => {
      client.user.setPresence({
          status: 'dnd',
          activities: [{ 
              name: '.help', 
              type: 0
          }]
      });

  });
}

module.exports = { setPresence };