const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "help",
    description: "Mostra os comandos do bot em páginas.",
    async execute(interaction) {
        const pages = [
            new EmbedBuilder()
                .setTitle("📖 Help - Página 1")
                .setDescription("💡 Aqui estão os comandos de moderação:\n`ban`, `kick`, `mute`, `unmute`, `warn`")
                .setColor("Blue"),
            
            new EmbedBuilder()
                .setTitle("📖 Help - Página 2")
                .setDescription("🎵 Comandos de música:\n`play`, `pause`, `stop`, `skip`, `queue`")
                .setColor("Green"),
            
            new EmbedBuilder()
                .setTitle("📖 Help - Página 3")
                .setDescription("🛠️ Comandos utilitários:\n`ping`, `avatar`, `serverinfo`, `userinfo`")
                .setColor("Yellow"),
            
            new EmbedBuilder()
                .setTitle("📖 Help - Página 4")
                .setDescription("🎉 Comandos divertidos:\n`meme`, `8ball`, `coinflip`, `roll`")
                .setColor("Purple"),
        ];

        let page = 0;

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await interaction.reply({
            embeds: [pages[page]],
            components: [buttons],
            fetchReply: true
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i) => {
            if (i.customId === "prev") page--;
            else if (i.customId === "next") page++;

            buttons.components[0].setDisabled(page === 0);
            buttons.components[1].setDisabled(page === pages.length - 1);

            await i.update({ embeds: [pages[page]], components: [buttons] });
        });

        collector.on("end", () => {
            buttons.components.forEach(button => button.setDisabled(true));
            message.edit({ components: [buttons] }).catch(() => {});
        });
    }
};
