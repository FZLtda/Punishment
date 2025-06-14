const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'test',
    description: 'Exibe os comandos disponíveis.',
    execute: async (interaction) => {
        const pages = [
            new EmbedBuilder().setTitle('🔧 Moderação').setDescription('Comandos de moderação:\n`ban`, `kick`, `mute`, `warn`').setColor('#ff0000'),
            new EmbedBuilder().setTitle('⚙️ Utilidade').setDescription('Comandos úteis:\n`ping`, `serverinfo`, `userinfo`').setColor('#0080ff'),
            new EmbedBuilder().setTitle('🎉 Diversão').setDescription('Comandos divertidos:\n`8ball`, `meme`, `gif`').setColor('#ff8000'),
        ];

        let currentPage = 0;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.reply({ embeds: [pages[currentPage]], components: [row], ephemeral: true });

        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'prev') {
                currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
            } else if (buttonInteraction.customId === 'next') {
                currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
            }

            await buttonInteraction.update({ embeds: [pages[currentPage]], components: [row] });
        });
    }
};
