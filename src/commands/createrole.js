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
    description: 'Cria um cargo no servidor com configurações avançadas.',
    usage: '${currentPrefix}createrole <nome> [cor] [permissões] [posição] [menção automática]',
    permissions: 'Gerenciar Cargos',
    async execute(message, args) {
        try {
            // Verifica permissões do usuário
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'Você não tem permissão para usar este comando.', iconURL: 'https://bit.ly/43PItSI' })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            // Verifica permissões do bot
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'Não tenho permissão para criar cargos.', iconURL: 'https://bit.ly/43PItSI' })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            // Verifica se o nome do cargo foi fornecido
            if (!args[0]) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'Você precisa fornecer um nome para o cargo.', iconURL: 'https://bit.ly/43PItSI' })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            const roleName = args[0];
            const colorInput = args[1] ? args[1].toUpperCase() : 'WHITE';
            const roleColor = colorMapping[colorInput] || (colorInput.startsWith('#') ? colorInput : null);

            // Valida a cor
            if (!roleColor) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'A cor fornecida é inválida. Use um nome de cor válido ou um código hexadecimal.', iconURL: 'https://bit.ly/43PItSI' })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            const permissionsInput = args.slice(2).join(' ');
            let resolvedPermissions = new PermissionsBitField();
            let invalidPermissions = [];

            // Resolve permissões
            if (permissionsInput) {
                const permissionsArray = permissionsInput
                    .toUpperCase()
                    .replace(/,/g, ' ') // Substitui vírgulas por espaços
                    .split(/\s+/) // Divide por espaços
                    .map(perm => perm.trim());

                permissionsArray.forEach(perm => {
                    const formattedPerm = perm.toUpperCase().replace(/ /g, '_'); // Corrige nomes errados
                    if (PermissionsBitField.Flags[formattedPerm]) {
                        resolvedPermissions.add(PermissionsBitField.Flags[formattedPerm]);
                    } else {
                        invalidPermissions.push(perm);
                    }
                });
            }

            // Verifica permissões inválidas
            if (invalidPermissions.length > 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'As seguintes permissões são inválidas:', iconURL: 'https://bit.ly/43PItSI' })
                            .setDescription(`\`${invalidPermissions.join(', ')}\``)
                            .addFields({
                                name: 'Permissões válidas',
                                value: Object.keys(PermissionsBitField.Flags).join(', '),
                            })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            // Define a posição do cargo
            const position = args[3] ? parseInt(args[3], 10) : null;
            if (position && (isNaN(position) || position < 0 || position > message.guild.roles.cache.size)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF4C4C')
                            .setAuthor({ name: 'A posição fornecida é inválida. Use um número válido.', iconURL: 'https://bit.ly/43PItSI' })
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            // Define se o cargo será mencionável
            const mentionable = args[4] ? args[4].toLowerCase() === 'true' : false;

            // Cria o cargo
            const newRole = await message.guild.roles.create({
                name: roleName,
                color: roleColor,
                permissions: resolvedPermissions.bitfield,
                position: position || undefined,
                mentionable: mentionable,
                reason: `Criado por ${message.author.tag}`,
            });

            // Envia confirmação
            const embed = new EmbedBuilder()
                .setTitle('<:emoji_33:1219788320234803250> Cargo Criado com Sucesso!')
                .setColor(roleColor)
                .addFields(
                    { name: 'Nome do Cargo', value: newRole.name, inline: true },
                    { name: 'Cor', value: newRole.hexColor.toUpperCase(), inline: true },
                    { name: 'Permissões', value: newRole.permissions.toArray().join(', ') || 'Nenhuma', inline: false },
                    { name: 'Posição', value: position ? position.toString() : 'Padrão', inline: true },
                    { name: 'Mencionável', value: mentionable ? 'Sim' : 'Não', inline: true }
                )
                .setFooter({ text: `Criado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao criar o cargo:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF4C4C')
                        .setAuthor({ name: 'Não foi possível criar o cargo.', iconURL: 'https://bit.ly/43PItSI' })
                ],
                allowedMentions: { repliedUser: false }
            });
        }
    },
};