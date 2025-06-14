const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class Paginator {
    constructor(pages) {
        this.pages = pages;
        this.currentPage = 0;
    }

    getPageEmbed() {
        return this.pages[this.currentPage];
    }

    getButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
        );
    }

    handleInteraction(interaction) {
        if (interaction.customId === 'prev') {
            this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.pages.length - 1;
        } else if (interaction.customId === 'next') {
            this.currentPage = this.currentPage < this.pages.length - 1 ? this.currentPage + 1 : 0;
        }
        return { embeds: [this.getPageEmbed()], components: [this.getButtons()] };
    }
}

module.exports = Paginator;
