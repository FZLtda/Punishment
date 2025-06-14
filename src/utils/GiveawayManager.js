const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { red, yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const TimeParser = require('./TimeParser');
const WinnerSelector = require('./WinnerSelector');
const db = require('../data/database');

class GiveawayManager {
    constructor(client) {
        if (!GiveawayManager.instance) {
            this.client = client;
            GiveawayManager.instance = this;
        }
        return GiveawayManager.instance;
    }

    async startGiveaway(message, args) {
        if (args[0] !== 'start') {
            return this.sendErrorEmbed(message, 'Uso correto: `.giveaway start <tempo> <ganhadores> <prêmio>`');
        }

        const { durationMs, endTime } = TimeParser.parse(args[1]);
        const winnerCount = parseInt(args[2]);
        const prize = args.slice(3).join(' ');

        if (!durationMs || isNaN(winnerCount) || !prize) {
            return this.sendErrorEmbed(message, 'Uso correto: `.giveaway start <tempo> <ganhadores> <prêmio>`');
        }

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

        db.prepare(`
            INSERT INTO giveaways (guild_id, channel_id, message_id, prize, duration, winners, end_time, participants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(message.guild.id, message.channel.id, giveawayMessage.id, prize, durationMs, winnerCount, endTime, JSON.stringify([]));

        message.delete().catch(() => null);

        setTimeout(() => this.finalizeGiveaway(giveawayMessage.id, message.guild.id), durationMs);
    }

    async finalizeGiveaway(messageId, guildId) {
        const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
        if (!giveaway) return;

        let winners = WinnerSelector.select(JSON.parse(giveaway.participants), giveaway.winners);

        try {
            const channel = await this.client.channels.fetch(giveaway.channel_id);
            const message = await channel.messages.fetch(giveaway.message_id);

            const winnerMessage = winners.length > 0 ?
                `🎉 Parabéns ${winners.join(', ')}! Você(s) ganhou/ganharam **${giveaway.prize}**!` :
                '😢 Nenhum vencedor foi escolhido porque ninguém participou.';

            const embed = new EmbedBuilder()
                .setTitle('🏆 Sorteio Finalizado')
                .setDescription(`**Prêmio:** \`${giveaway.prize}\`\n**Participantes:** \`${giveaway.participants.length}\`\n**Ganhador(es):** ${winners.length > 0 ? winners.join(', ') : '`Nenhum vencedor`'}`)
                .setColor(red)
                .setFooter({ text: 'Sorteio encerrado!' });

            await message.edit({ embeds: [embed], components: [] });
            await channel.send(winnerMessage);
            db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(messageId);
        } catch (error) {
            console.error(`Erro ao finalizar sorteio: ${error.message}`);
        }
    }

    sendErrorEmbed(message, text) {
        const embed = new EmbedBuilder().setColor(yellow).setAuthor({ name: text, iconURL: icon_attention });
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}

module.exports = new GiveawayManager();
