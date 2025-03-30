const { EmbedBuilder } = require('discord.js');
const afkUsers = new Map();

module.exports = {
    name: 'afk',
    description: 'Define seu status como AFK (Away From Keyboard).',
    usage: '${currentPrefix}afk [motivo]',
    permissions: 'Enviar Mensagens',
    async execute(message, args) {
        const reason = args.join(' ') || 'Sem motivo especificado.';

        afkUsers.set(message.author.id, reason);

        if (message.member.manageable) {
            try {
                await message.member.setNickname(`[AFK] ${message.member.displayName}`);
            } catch (error) {
                console.error(`INFO: Erro ao alterar o apelido de ${message.author.tag}:`, error);
            }
        }

        await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('<:emoji_50:1240119111284162644> Modo AFK Ativado')
                    .setDescription(`Você agora está ausente.\n**Motivo:** ${reason}`)
                    .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
            ]
        });

        const filter = (msg) => msg.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 86400000 });

        collector.on('collect', async (msg) => {
            if (afkUsers.has(msg.author.id)) {
                afkUsers.delete(msg.author.id);

                if (message.member.manageable) {
                    try {
                        await message.member.setNickname(message.member.displayName.replace('[AFK] ', ''));
                    } catch (error) {
                        console.error(`INFO: Erro ao restaurar o apelido de ${message.author.tag}:`, error);
                    }
                }

                msg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('<:emoji_48:1207522369426423808> Bem-vindo de volta!')
                            .setDescription('Seu status **AFK** foi removido.')
                            .setFooter({ text: `${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                            .setTimestamp()
                    ], allowedMentions: { repliedUser: false }
                });
            }
        });

        message.client.on('messageCreate', (msg) => {
            if (msg.mentions.members.size > 0 && !msg.author.bot) {
                msg.mentions.members.forEach((mentionedUser) => {
                    if (afkUsers.has(mentionedUser.id)) {
                        const reason = afkUsers.get(mentionedUser.id);
                        msg.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Yellow')
                                    .setTitle('<:emoji_50:1240119111284162644> Usuário AFK')
                                    .setDescription(`**${mentionedUser.displayName}** está atualmente **AFK**.\n**Motivo:** ${reason}`)
                                    .setThumbnail(mentionedUser.user.displayAvatarURL({ dynamic: true }))
                                    .setTimestamp()
                            ], allowedMentions: { repliedUser: false }
                        });
                    }
                });
            }
        });
    }
};