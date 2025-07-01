const { EmbedBuilder } = require('discord.js');
const { getSystemHealth } = require('@utils/healthMonitor');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'status',
  description: 'Exibe o status de conexão do bot e seus serviços.',
  usage: '${currentPrefix}status',
  userPermissions: ['ManageGuild'],
  deleteMessage: true,

  async execute(message) {
    const { mongoStatus, discordLatency, commandStats } = await getSystemHealth(message.client);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`${emojis.success} Sistema operacional`)
      .addFields(
        { name: '🗄️ MongoDB', value: mongoStatus.status, inline: true },
        { name: '📡 Latência Discord', value: `${discordLatency}ms`, inline: true },
        {
          name: '📦 Comandos carregados',
          value: `Prefixados: \`${commandStats.prefixCount}\`\nSlash: \`${commandStats.slashCount}\``,
          inline: false
        }
      )
      .setFooter({
        text: `Punishment • status`,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
