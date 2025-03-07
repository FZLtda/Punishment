const { PermissionsBitField, EmbedBuilder } = require('discord.js');

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
        const roleColor = colorMapping[colorInput] || colorInput;
        const rolePermissions = args.slice(2).join(' ');

        try {
            let resolvedPermissions = new PermissionsBitField(0); // Inicializa sem permissões

            if (rolePermissions) {
                rolePermissions
                    .toUpperCase()
                    .split(',')
                    .map(perm => perm.trim())
                    .forEach(perm => {
                        if (PermissionsBitField.Flags[perm]) {
                            resolvedPermissions = resolvedPermissions.add(PermissionsBitField.Flags[perm]);
                        }
                    });
            }

            const newRole = await message.guild.roles.create({
                name: roleName,
                color: roleColor,
                permissions: resolvedPermissions.bitfield,
                reason: `Criado por ${message.author.tag}`,
            });

            const embed = new EmbedBuilder()
                .setTitle('<:emoji_33:1219788320234803250> Cargo Criado com Sucesso!')
                .setColor(roleColor)
                .addFields(
                    { name: 'Nome do Cargo', value: newRole.name, inline: true },
                    { name: 'Cor', value: newRole.hexColor.toUpperCase(), inline: true },
                    { name: 'Permissões', value: resolvedPermissions.toArray().join(', ') || 'Nenhuma', inline: false }
                )
                .setFooter({ text: `Criado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao criar o cargo:', error);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({ name: 'Não foi possível criar o cargo.', iconURL: 'http://bit.ly/4aIyY9j' })],
                allowedMentions: { repliedUser: false }
            });
        }
    },
};
