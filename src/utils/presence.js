function setPresence(client) {
    client.on('ready', () => {
      client.user.setPresence({
        activities: [{ name: '.help', type: 'PLAYING' }],
        status: 'dnd',
      });
      console.log(`[INFO] Bot conectado como ${client.user.tag}`);
    });
  }
  
  module.exports = { setPresence };