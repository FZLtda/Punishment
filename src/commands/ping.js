const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Mostra a latência do bot e a latência da API do Discord.',
    async execute(message) {
        const msg = await message.channel.send('Calculando...');

        const botLatency = msg.createdTimestamp - message.createdTimestamp;

        const apiLatency = message.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor('#00FF00')
            .addFields(
                { name: '📡 Latência do Bot', value: `${botLatency}ms`, inline: true },
                { name: '🌐 Latência da API', value: `${apiLatency}ms`, inline: true },
            )
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await msg.edit({ content: '', embeds: [embed] });
    },
};