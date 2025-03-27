const { Client } = require('discord.js');

module.exports = {
    name: 'servers',
    description: 'Mostra os servidores em que o bot está conectado.',
    async execute(message, args) {
        message.channel.send('Lista de servidores:');
        message.client.guilds.cache.forEach(guild => {
            message.channel.send(guild.name);
        });
    },
};
