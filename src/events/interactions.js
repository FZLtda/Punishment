const { EmbedBuilder } = require('discord.js');
const db = require('../data/sorteios');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const [action, sorteioID] = interaction.customId.split('_');

        db.get(`SELECT * FROM sorteios WHERE id = ?`, [sorteioID], (err, row) => {
            if (err || !row) {
                const embedErro = new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({
                        name: 'Sorteio não encontrado.',
                        iconURL: 'http://bit.ly/4aIyY9j',
                    });

                return interaction.reply({ embeds: [embedErro], ephemeral: true });
            }

            let participantes = JSON.parse(row.participantes);

            if (action === 'participar') {
                if (participantes.includes(interaction.user.id)) {
                    return interaction.reply({ content: '❌ Você já está participando deste sorteio!', ephemeral: true });
                }

                participantes.push(interaction.user.id);
                db.run(`UPDATE sorteios SET participantes = ? WHERE id = ?`, [JSON.stringify(participantes), sorteioID]);

                return interaction.reply({ content: '✅ Você entrou no sorteio!', ephemeral: true });
            }

            if (action === 'ver') {
                return interaction.reply({ content: `👥 Total de participantes: **${participantes.length}**`, ephemeral: true });
            }
        });
    },
};