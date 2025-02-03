const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'getprefix',
    description: 'Exibe o prefixo atual do bot neste servidor.',
    async execute(message, args, { getPrefix }) {
        const currentPrefix = getPrefix(message.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('Prefixo Atual')
            .setDescription(`O prefixo atual deste servidor é: \`${currentPrefix}\``)
            .setColor('#0099ff');

        message.channel.send({ embeds: [embed] });
    },
};