const { EmbedBuilder } = require('discord.js');
const { getSquareAppStatus } = require('../../utils/squareUtils');
const { red, green, yellow } = require('../../config/colors.json');
const { icon_shutdown } = require('../../config/emoji.json');

module.exports = {
  name: 'squarestatus',
  description: 'Exibe o status atual da aplicação na SquareCloud.',
  category: 'Administração',
  async execute(message) {
    const ownerIds = process.env.OWNERS_ID?.split(',') || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`${icon_shutdown} | Você não tem permissão para ver o status da aplicação.`)
        ]
      });
    }

    const data = await getSquareAppStatus();

    if (data.error) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setTitle('Erro ao consultar a API da SquareCloud')
            .setDescription(`Erro: ${data.message}`)
            .addFields(
              data.raw ? {
                name: '🔍 Resposta da API',
                value: `\`\`\`json\n${JSON.stringify(data.raw, null, 2)}\n\`\`\``
              } : {}
            )
        ]
      });
    }

    const statusColors = {
      online: green,
      running: green,
      off: red,
      shutdown: red,
      starting: yellow,
      restarting: yellow
    };

    const embed = new EmbedBuilder()
      .setTitle('📊 Status da SquareCloud')
      .setColor(statusColors[data.application.status] || yellow)
      .addFields(
        { name: '🆔 App ID', value: data.application.id, inline: true },
        { name: '📡 Status', value: `\`${data.application.status.toUpperCase()}\``, inline: true },
        { name: '🧠 RAM', value: `\`${data.application.ram.used}MB / ${data.application.ram.total}MB\``, inline: true },
        { name: '⚙️ CPU', value: `\`${data.application.cpu}%\``, inline: true },
        { name: '🕓 Último Start', value: `<t:${Math.floor(data.application.last_restart / 1000)}:R>` }
      )
      .setFooter({ text: 'Dados em tempo real via API SquareCloud' });

    return message.channel.send({ embeds: [embed] });
  }
};
