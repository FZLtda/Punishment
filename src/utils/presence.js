function setPresence(client) {
  client.on('ready', () => {
      client.user.setPresence({
          status: 'online',
          activities: [{ 
              name: '.help | .doar', 
              type: 0
          }]
      });

  });
}

module.exports = { setPresence };


