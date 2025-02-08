function setPresence(client) {
  client.on('ready', () => {
      client.user.setPresence({
          status: 'dnd',
          activities: [{ 
              name: '.help', 
              type: 'PLAYING'
          }]
      });

      console.log(`[INFO] Bot conectado como ${client.user.tag}`);
  });
}

module.exports = { setPresence };