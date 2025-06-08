const { EmbedBuilder } = require('discord.js');

async function sendAlert(client, guild, executor, actionType, count, timeWindow) {
  const logChannelId = '1381065414246662286';
  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('🚨 Atividade Suspeita Detectada')
    .setDescription(`Ação suspeita detectada em **${guild.name}**`)
    .addFields(
      { name: 'Usuário', value: `${executor.tag} (\`${executor.id}\`)`, inline: false },
      { name: 'Ação', value: actionType, inline: true },
      { name: 'Ocorrências', value: `${count} em ${timeWindow}`, inline: true },
    )
    .setFooter({ text: 'Sistema de Inteligência Preditiva' })
    .setTimestamp();

  logChannel.send({ embeds: [embed] });
}

module.exports = { sendAlert };
