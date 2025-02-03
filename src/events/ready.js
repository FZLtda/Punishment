module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[SUCESSO] Bot iniciado como ${client.user.tag}`);

    client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: '.help',
          type: 0,
        },
      ],
    });

    console.log('[INFO] Presença configurada para: Jogando .help');
  },
};