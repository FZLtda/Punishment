'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels, bot } = require('@config');
const Logger = require('@logger');

module.exports = {
    name: 'guildMemberRemove',
    description: 'Notifica quando um membro sai do servidor específico.',
    once: false,

    /**
     * Executa quando um membro sai do servidor
     * @param {import('discord.js').GuildMember} member
     * @param {import('discord.js').Client} client
     */
    async execute(member, client) {
        try {
            // Garantir que o evento só funcione no servidor configurado
            if (member.guild.id !== bot.serverId) return;

            const channel = await client.channels.fetch(channels.log).catch(() => null);
            if (!channel) {
                return Logger.warn(
                    `[guildMemberRemove] Canal de logs (${channels.log}) não encontrado no servidor ${member.guild.id}.`
                );
            }

            const user = member.user ?? { id: member.id, tag: 'Usuário desconhecido' };

            const embed = new EmbedBuilder()
                .setTitle(`${emojis?.kick} Membro saiu`)
                .setColor(colors?.red)
                .setDescription(`<@${user.id}> (\`${user.id}\`) saiu do servidor.`)
                .setThumbnail(user.displayAvatarURL?.({ dynamic: true }) || null)
                .setFooter({
                    text: member.guild.name,
                    iconURL: member.guild.iconURL?.({ dynamic: true }) || undefined
                })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            Logger.info(
                `[guildMemberRemove] Membro ${user.tag} (${user.id}) saiu do servidor ${member.guild.id}.`
            );
        } catch (error) {
            Logger.error('[guildMemberRemove] Erro ao processar saída de membro:', error);
        }
    }
};
