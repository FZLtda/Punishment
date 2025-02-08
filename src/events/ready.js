module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: '.help',
          type: 0,
        },
      ],
    });
  },
};