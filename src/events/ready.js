module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    try {
      console.log(`[SUCESSO] Bot iniciado como ${client.user.tag}`);

      client.user.setPresence({
        status: 'dnd',
        activities: [
          {
            name: '.help',
            type: 'PLAYING',
          },
        ],
      });

      console.log('[INFO] Presença configurada para: Jogando .help');
    } catch (error) {
      console.error('[ERROR] Erro ao configurar a presença:', error.message);
    }

    try {

      const guildCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      console.log(`[INFO] Atualmente em ${guildCount} servidores, com um total de ${userCount} usuários.`);
    } catch (error) {
      console.error('[ERROR] Erro ao obter informações dos servidores ou usuários:', error.message);
    }
  },
};