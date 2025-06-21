const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
}

module.exports = {
  name: 'uptime',
  description: 'Exibe as estatísticas do bot.',
  usage: '${currentPrefix}uptime',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  execute: async (message) => {
    try {
      
      const uptime = formatUptime(process.uptime());

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Punishment Uptime')
        .addFields(
          {  
            name: '<:1000043158:1336324199202947144> Uptime',
            value: `ﾠ \`${uptime}\``,
            inline: false
          }

        )
        .setFooter({
          text: `${message.client.user.username}`,
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERROR] Não foi possível obter as estatísticas:', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível recuperar as estatísticas do bot devido a um erro.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
