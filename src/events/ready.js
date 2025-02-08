module.exports = (client) => {
  console.log(`Bot está online como ${client.user.tag}`);

  
  client.user.setPresence({
      status: 'dnd', 
      activities: [{
          name: '.help',
          type: 0 
      }]
  });
};