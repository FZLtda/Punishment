const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Exibe detalhes da conexão do bot com o Discord.',
  usage: '.ping',
  permissions: 'Nenhuma',
  execute: async (message) => {
    const msg = await message.reply('Calculando...');
    const latency = msg.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('🏓 Pong!')
      .setDescription(
        `<:1000042776:1335945378029240412> **Latência:** \`${latency}ms\`\n` +
        `<:1000042776:1335945378029240412> **Latência da API:** \`${apiLatency}ms\``
      )
      .setFooter({
        text: `${message.client.user.username}`,
        iconURL: message.client.user.displayAvatarURL(),
      });

    return msg.edit({
      content: null,
      embeds: [embed],
    });
  },
};
