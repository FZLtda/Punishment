const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/sorteios');
const { v4: uuidv4 } = require('uuid');
const { finalizarSorteio } = require('../utils/finalizarSorteio');

module.exports = {
    name: 'sorteio',
    description: 'Gerencia sorteios no servidor.',
    usage: '.sorteio iniciar <tempo> <prêmio>',
    permissions: 'Gerenciar Servidor',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageGuild')) {
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Você não tem permissão para iniciar um sorteio.',
                    iconURL: 'http://bit.ly/4aIyY9j',
                });

            return message.reply({ embeds: [embedErro] });
        }

        const action = args[0]?.toLowerCase();
        if (action !== 'iniciar' || args.length < 3) {
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Uso incorreto! Exemplo: `.sorteio iniciar 10 Gift Card R$50`',
                    iconURL: 'http://bit.ly/4aIyY9j',
                });

            return message.reply({ embeds: [embedErro] });
        }

        const tempo = parseInt(args[1]) * 60000;
        const premio = args.slice(2).join(' ');
        const sorteioID = uuidv4();
        const criadoEm = Date.now();
        const finalizaEm = criadoEm + tempo;

        db.run(
            `INSERT INTO sorteios (id, premio, criado_em, finaliza_em, participantes) VALUES (?, ?, ?, ?, ?)`,
            [sorteioID, premio, criadoEm, finalizaEm, JSON.stringify([])]
        );

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 Novo Sorteio Iniciado!')
            .setDescription(`🎁 **Prêmio:** \`${premio}\`\n⏳ **Termina em:** <t:${Math.floor(finalizaEm / 1000)}:R>`)
            .setFooter({ text: 'Clique no botão abaixo para participar!' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`participar_${sorteioID}`).setLabel('Participar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`ver_${sorteioID}`).setLabel('👥 Participantes').setStyle(ButtonStyle.Secondary)
        );

        await message.reply({ embeds: [embed], components: [row] });

        setTimeout(() => finalizarSorteio(sorteioID, message.channel), tempo);
    },
};