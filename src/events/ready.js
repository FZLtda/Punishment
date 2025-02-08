module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    try {
      console.log(`[SUCESSO] Bot iniciado como ${client.user.tag}`);

      // Configurando a presença do bot
      client.user.setPresence({
        activities: [
          {
            name: '.help', 
            type: '0',
          },
        ],
        status: 'dnd',
      });

      console.log('[INFO] Presença configurada com sucesso: Jogando .help');
    } catch (error) {
      console.error('[ERROR] Erro ao configurar a presença:', error.message);
    }

    try {
     
      const guildCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce(
        (acc, guild) => acc + (guild.memberCount || 0),
        0
      );

      console.log(`[INFO] Atualmente em ${guildCount} servidores, com um total de ${userCount} usuários.`);
    } catch (error) {
      console.error('[ERROR] Erro ao obter informações dos servidores ou usuários:', error.message);
    }
  },
};