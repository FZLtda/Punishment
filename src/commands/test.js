const { EmbedBuilder } = require('discord.js');
const Paginator = require('../utils/paginator');

module.exports = {
    name: 'test',
    description: 'Exibe os comandos disponíveis.',
    execute: async (interaction) => {
        const pages = [
            new EmbedBuilder().setTitle('🔧 Moderação').setDescription('Comandos:\n`ban`, `kick`, `mute`, `warn`').setColor('#ff0000'),
            new EmbedBuilder().setTitle('⚙️ Utilidade').setDescription('Comandos:\n`ping`, `serverinfo`, `userinfo`').setColor('#0080ff'),
            new EmbedBuilder().setTitle('🎉 Diversão').setDescription('Comandos:\n`8ball`, `meme`, `gif`').setColor('#ff8000'),
        ];

        const paginator = new Paginator(pages);
        const response = await interaction.reply({ embeds: [paginator.getPageEmbed()], components: [paginator.getButtons()], ephemeral: true });

        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            await buttonInteraction.update(paginator.handleInteraction(buttonInteraction));
        });
    }
};
