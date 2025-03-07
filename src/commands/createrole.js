const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const colorMapping = {
    RED: '#FF0000',
    BLUE: '#3498DB',
    GREEN: '#2ECC71',
    YELLOW: '#F1C40F',
    ORANGE: '#E67E22',
    PURPLE: '#9B59B6',
    PINK: '#FFC0CB',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY: '#808080',
};

module.exports = {
    name: 'createrole',
    description: 'Cria um cargo no servidor com configurações personalizadas.',
    usage: '${currentPrefix}createrole <nome> [cor] [permissões]',
    permissions: 'Gerenciar Cargos',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({ name: 'Você não possui permissão para usar este comando.', iconURL: 'http://bit.ly/4aIyY9j' })],
                allowedMentions: { repliedUser: false }
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({ name: 'Não tenho permissão para criar cargos no servidor.', iconURL: 'http://bit.ly/4aIyY9j' })],
                allowedMentions: { repliedUser: false }
            });
        }

        if (!args[0]) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({ name: 'Você precisa fornecer um nome para o cargo.', iconURL: 'http://bit.ly/4aIyY9j' })],
                allowedMentions: { repliedUser: false }
            });
        }

        const roleName = args[0];
        const colorInput = args[1] ? args[1].toUpperCase() : '#FFFFFF';
        let roleColor = colorMapping[colorInput] || colorInput;

        const hexRegex = /^#([0-9A-F]{6})$/i;
        if (!hexRegex.test(roleColor)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({ name: 'Você precisa fornecer um nome para o cargo.', iconURL: 'http://bit.ly/4aIyY9j' })],
                allowedMentions: { repliedUser: false }
            });
        }

        const rolePermissions = args.slice(2).join(' ');
        let resolvedPermissions = new PermissionsBitField(0);

        if (rolePermissions) {
            rolePermissions
                .toUpperCase()
                .split(/\s|,/)
                .map(perm => perm.trim())
                .forEach(perm => {
                    if (PermissionsBitField.Flags[perm]) {
                        resolvedPermissions = resolvedPermissions.add(PermissionsBitField.Flags[perm]);
                    }
                });
        }

        const embedConfirm = new EmbedBuilder()
            .setTitle('⚠️ Confirmação de Criação de Cargo')
            .setColor(roleColor)
            .addFields(
                { name: 'Nome do Cargo', value: roleName, inline: true },
                { name: 'Cor', value: roleColor.toUpperCase(), inline: true },
                { name: 'Permissões', value: resolvedPermissions.toArray().join(', ') || 'Nenhuma', inline: false }
            )
            .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_create_role')
                .setLabel('✅ Criar Cargo')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel_create_role')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        const reply = await message.channel.send({ embeds: [embedConfirm], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_create_role') {
                try {
                    const newRole = await message.guild.roles.create({
                        name: roleName,
                        color: roleColor,
                        permissions: resolvedPermissions.bitfield,
                        reason: `Criado por ${message.author.tag}`,
                    });

                    const embedSuccess = new EmbedBuilder()
                        .setTitle('<:emoji_33:1219788320234803250> Cargo Criado com Sucesso!')
                        .setColor(roleColor)
                        .addFields(
                            { name: 'Nome do Cargo', value: newRole.name, inline: true },
                            { name: 'Cor', value: newRole.hexColor.toUpperCase(), inline: true },
                            { name: 'Permissões', value: resolvedPermissions.toArray().join(', ') || 'Nenhuma', inline: false }
                        )
                        .setFooter({ text: `Criado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    await i.update({ embeds: [embedSuccess], components: [] });
                } catch (error) {
                    console.error('Erro ao criar o cargo:', error);
                    await i.update({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'Não foi possível criar o cargo.', iconURL: 'http://bit.ly/4aIyY9j' })],
                        components: []
                    });
                }
            } else if (i.customId === 'cancel_create_role') {
                await i.update({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF4C4C')
                        .setTitle('Criação do Cargo Cancelada')],
                    components: []
                });
            }
            collector.stop();
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                reply.edit({
                    embeds: [embedConfirm.setTitle('Tempo Expirado').setColor('#FF4C4C')],
                    components: []
                });
            }
        });
    },
};
