function setPresence(client) {
  client.on('ready', () => {
    
    const statusMessages = [
      '.help',
      '.doar',
      '.stats',
      '.privacy',
      '.setprefix',
      'A partir de 10/05, todo o projeto será migrado para TypeScript.'
    ];

    let index = 0;

    setInterval(() => {
      client.user.setPresence({
        status: 'dnd',
        activities: [{ 
          name: statusMessages[index],
          type: 0 
        }]
      });
      
      index = (index + 1) % statusMessages.length;
    }, 5000);
  });
}

module.exports = { setPresence };
