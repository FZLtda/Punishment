function setPresence(client) {
  client.once('ready', () => {
    console.log('Bot está online!'); // Adicionando um log para garantir que o bot está pronto

    const statusMessages = [
      '.help',
      '.doar',
      '.stats',
      '.privacy'
    ];

    let index = 0;
    setInterval(() => {
      client.user.setActivity(statusMessages[index], { type: 'PLAYING' }); // Altera o texto do status
      console.log(`Status alterado para: ${statusMessages[index]}`);
      
      index = (index + 1) % statusMessages.length;
    }, 5000); // Muda o texto do status a cada 5000 milissegundos (5 segundos)
  });
}

module.exports = { setPresence };
