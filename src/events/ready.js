module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
      console.log(`[INFO] Bot iniciado como ${client.user.tag}`);
    },
  };
  