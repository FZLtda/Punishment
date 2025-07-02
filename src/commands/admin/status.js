'use strict';

const { EmbedBuilder } = require('discord.js');
const { getSystemHealth } = require('@utils/healthMonitor');
const { colors, emojis } = require('@config');
const Logger = require('@logger');

module.exports = {
  name: 'status',
  description: 'Exibe o status de conexão do bot e seus serviços.',
  usage: '${currentPrefix}status',
  category: 'Sistema',
  cooldown: 5,
  userPermissions: ['ManageGuild'],
  deleteMessage: true,

  async execute(message) {
    try {
      const { client } = message;

      // Coleta os dados do sistema
      const healthData = await getSystemHealth(client);

      // Fallbacks seguros
      const mongoStatus = healthData?.mongoStatus?.status ?? 'Desconhecido';
      const latency = typeof healthData?.discordLatency === 'number' ? `${healthData.discordLatency}ms` : 'N/A';
      const prefixCount = healthData?.commandStats?.prefixCount ?? 0;
      const slashCount = healthData?.commandStats?.slashCount ?? 0;

      // Embed de status
      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle('Sistema operacional')
        .addFields(
          { name: '🗄️ MongoDB', value: mongoStatus, inline: true },
          { name: '📡 Latência Discord', value: latency, inline: true },
          {
            name: '📦 Comandos carregados',
            value: `Prefixados: \`${prefixCount}\`\nSlash: \`${slashCount}\``,
            inline: false
          }
        )
        .setFooter({
          text: `${client.user?.username || 'Bot'} • status`,
          iconURL: client.user?.displayAvatarURL() || undefined
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      Logger.error(`Erro ao executar o comando 'status': ${error.stack || error.message}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle(`${emojis.attent} Erro ao exibir o status`)
        .setDescription('Ocorreu um erro inesperado ao tentar obter o status do sistema.')
        .setFooter({
          text: 'Punishment • erro interno',
          iconURL: message.client.user?.displayAvatarURL() || undefined
        })
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] }).catch(() => {
        message.reply('Ocorreu um erro e não foi possível enviar o embed.');
      });
    }
  }
};
