const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Exibe há quanto tempo o bot está online.',
    async execute(message) {
        const totalSeconds = process.uptime();
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const nodeVersion = process.version;
        const discordJsVersion = require('discord.js').version;

        const embed = new EmbedBuilder()
            .setTitle('Tempo de Atividade do Bot')
            .setColor('#00FF00')
            .addFields(
                { name: '🕒 Uptime', value: uptimeString, inline: true },
                { name: '💻 Uso de Memória', value: `${memoryUsage} MB`, inline: true },
                { name: '⚙️ Node.js', value: nodeVersion, inline: true },
                { name: '📚 Discord.js', value: `v${discordJsVersion}`, inline: true },
            )
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    },
};