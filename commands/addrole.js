const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'addrole',
    description: 'Adiciona um cargo a um membro.',
    usage: '.addrole <@membro> <@cargo>',
    permissions: ['ManageRoles'],
    async execute(message, args) {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
        }

        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!member || !role) {
            return message.reply('<:no:1122370713932795997> Uso incorreto do comando. Use: `.addrole @membro @cargo`');
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('<:no:1122370713932795997> Não posso adicionar este cargo, pois ele está acima do meu cargo mais alto.');
        }

        if (member.roles.cache.has(role.id)) {
            return message.reply(`<:no:1122370713932795997> O usuário já possui este cargo.`);
        }

        try {
            await member.roles.add(role);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('<:emoji_46:1236675567496069120> Cargo Adicionado')
                        .setDescription(`O cargo ${role} foi adicionado a ${member}.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                ]
            });
        } catch (error) {
            console.error(error);
            return message.reply('<:no:1122370713932795997> Erro ao tentar adicionar o cargo. Verifique minhas permissões.');
        }
    }
};