const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'report',
  description: 'Reporte um problema enviando informações para o servidor de suporte principal.',
  usage: '${currentPrefix}report',
  permissions: 'Enviar Mensagens',

  async execute(message) {
    try {
      const forumChannelId = '1277353794874900520';
      const supportGuildId = '1006910950286299246';
      const supportGuild = message.client.guilds.cache.get(supportGuildId);

      if (!supportGuild) return;

      const forumChannel = supportGuild.channels.cache.get(forumChannelId);

      if (!forumChannel || forumChannel.type !== 15) return;

      const embed = new EmbedBuilder()
        .setTitle('Reporte de Problemas')
        .setDescription('Clique no botão abaixo para reportar um problema. Suas informações serão enviadas para o canal de suporte.')
        .setColor(Colors.Red);

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open-report-modal')
          .setLabel('Reportar Problema')
          .setStyle('Danger')
      );

      await message.channel.send({ embeds: [embed], components: [buttonRow], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error(`Erro ao executar o comando report: ${error.message}`);
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não conseguimos processar seu reporte.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
