const db = require('../database/giveawayDatabase');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { red, yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

class GiveawayManager {
    constructor(client) {
        this.client = client;
    }

    async startGiveaway(message, args) {
        if (args[0] !== 'start') {
            return this.sendErrorEmbed(message, 'Uso correto: `.giveaway start <tempo> <ganhadores> <prêmio>`');
        }

        const timeInput = args[1];
        const winnerCount = parseInt(args[2]);
        const prize = args.slice(3).join(' ');

        if (!timeInput || isNaN(winnerCount) || !prize) {
            return this.sendErrorEmbed(message, 'Uso correto: `.giveaway start <tempo> <ganhadores> <prêmio>`');
        }

        const durationMs = this.convertTimeToMs(timeInput);
        if (!durationMs) {
            return this.sendErrorEmbed(message, 'Formato de tempo inválido! Use `1m`, `1h`, `1d`.');
        }

        const endTime = Date.now() + durationMs;

        const embed = new EmbedBuilder()
            .setTitle('🎉 Novo Sorteio')
            .setDescription(`**Prêmio:** \`${prize}\`\n**Ganhadores:** \`${winnerCount}\`\n**Termina:** <t:${Math.floor(endTime / 1000)}:f> (<t:${Math.floor(endTime / 1000)}:R>)`)
            .setColor(red)
            .setFooter({ text: 'Clique no botão para participar!' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('participar').setLabel('🎟 Participar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ver_participantes').setLabel('👥 Participantes: 0').setStyle(ButtonStyle.Secondary).setDisabled(true)
        );

        const giveawayMessage = await message.channel.send({ embeds: [embed], components: [row] });

        db.saveGiveaway(message.guild.id, message.channel.id, giveawayMessage.id, prize, durationMs, winnerCount, endTime);

        message.delete().catch(() => null);

        setTimeout(() => this.finalizeGiveaway(giveawayMessage.id, message.guild.id), durationMs);
    }

    async finalizeGiveaway(messageId, guildId) {
        const giveaway = db.getGiveaway(messageId);
        if (!giveaway) return;

        let participants = JSON.parse(giveaway.participants);
        let winners = this.selectWinners(participants, giveaway.winners);

        try {
            const channel = await this.client.channels.fetch(giveaway.channel_id);
            const message = await channel.messages.fetch(giveaway.message_id);

            const winnerMessage = winners.length > 0 ?
                `🎉 Parabéns ${winners.join(', ')}! Você(s) ganhou/ganharam **${giveaway.prize}**!` :
                '😢 Nenhum vencedor foi escolhido porque ninguém participou.';

            const embed = new EmbedBuilder()
                .setTitle('🏆 Sorteio Finalizado')
                .setDescription(`**Prêmio:** \`${giveaway.prize}\`\n**Participantes:** \`${participants.length}\`\n**Ganhador(es):** ${winners.length > 0 ? winners.join(', ') : '`Nenhum vencedor`'}`)
                .setColor(red)
                .setFooter({ text: 'Sorteio encerrado!' });

            await message.edit({ embeds: [embed], components: [] });
            await channel.send(winnerMessage);
            db.deleteGiveaway(messageId);
        } catch (error) {
            console.error(`Erro ao finalizar sorteio: ${error.message}`);
        }
    }

    convertTimeToMs(time) {
        const timeUnits = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const match = time.match(/^(\d+)([smhd])$/);
        return match ? parseInt(match[1]) * timeUnits[match[2]] : null;
    }

    selectWinners(participants, count) {
        if (participants.length === 0) return [];
        let winners = [];
        for (let i = 0; i < count && participants.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            winners.push(`<@${participants[randomIndex]}>`);
            participants.splice(randomIndex, 1);
        }
        return winners;
    }

    sendErrorEmbed(message, text) {
        const embed = new EmbedBuilder().setColor(yellow).setAuthor({ name: text, iconURL: icon_attention });
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}

module.exports = GiveawayManager;
                              
