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
    try {
      const { mongoStatus, discordLatency, commandStats } = await getSystemHealth(message.client);

      const embed = new EmbedBuilder()
        .setColor(colors?.primary ?? '#8c9cfc')
        .setTitle(`${emojis?.success ?? '✅'} Sistema operacional`)
        .addFields(
          { name: '🗄️ MongoDB', value: mongoStatus?.status ?? 'Desconhecido', inline: true },
          { name: '📡 Latência Discord', value: `${discordLatency ?? 0}ms`, inline: true },
          {
            name: '📦 Comandos carregados',
            value: `Prefixados: \`${commandStats?.prefixCount ?? 0}\`\nSlash: \`${commandStats?.slashCount ?? 0}\``,
            inline: false
          }
        )
        .setFooter({
          text: `Punishment • status`,
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Erro ao executar o comando status:', err);
      return message.reply('❌ Ocorreu um erro ao buscar o status. Verifique os logs.');
    }
  }
};
