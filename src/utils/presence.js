function setPresence(client) {
  client.on('ready', () => {
    console.log('Bot está online!');
    
    const statusMessages = [
      '.help | .doar',
      '.stats | .privacy',
      '.ping | .uptime',
      '.commands | .info'
    ];

    let index = 0;

    setInterval(() => {
      client.user.setPresence({
        status: 'dnd', // Status "Não Perturbe"
        activities: [{ 
          name: statusMessages[index], // Alterando o texto
          type: 0 // Tipo "Jogando" (PLAYING)
        }]
      });
      console.log(`Status alterado para: ${statusMessages[index]}`);
      
      // Atualiza o índice para o próximo status
      index = (index + 1) % statusMessages.length;
    }, 5000); // Muda o texto do status a cada 5000 milissegundos (5 segundos)
  });
}

module.exports = { setPresence };
