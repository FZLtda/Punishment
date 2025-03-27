function setPresence(client) {
  client.once('ready', () => {
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
  }, 5000);
});

module.exports = { setPresence };


