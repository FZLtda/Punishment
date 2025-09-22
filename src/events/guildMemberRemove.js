'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels } = require('@config');
const { sendModLog } = require('@modules/modlog');
const Logger = require('@logger');

module.exports = {
    name: 'guildMemberRemove',
    description: 'Notifica quando um membro sai do servidor.',
    once: false,

    /**
     * Executa quando um membro sai do servidor
     * @param {import('discord.js').GuildMember} member
     * @param {import('discord.js').Client} client
     */
    async execute(member, client) {
        try {
            const channel = await client.channels.fetch(channels.log).catch(() => null);

            if (!channel) {
                return Logger.warn(`[guildMemberRemove] Canal de logs (${channels.log}) não encontrado.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.kick} Membro saiu`)
                .setColor(colors.red)
                .setDescription(`${member} (\`${member.id}\`) saiu do servidor.`)
                .addFields(
                    { name: 'Usuário', value: member.user.tag, inline: true },
                    { name: 'ID', value: member.id, inline: true },
                    { name: 'Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: member.guild.name,
                    iconURL: member.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            // Enviar para log de moderação
            await sendModLog(member.guild, {
                action: 'Saída',
                target: member.user,
                moderator: null,
                reason: 'Membro saiu do servidor',
                extraFields: [
                    { name: 'Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                ]
            });

        } catch (error) {
            Logger.error('[guildMemberRemove] Erro ao processar saída de membro:', error);
        }
    }
};
