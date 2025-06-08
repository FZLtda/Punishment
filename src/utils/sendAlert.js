const { EmbedBuilder } = require('discord.js');

async function sendAlert(client, guild, executor, actionType, count, timeWindow) {
  const logChannelId = '1381065414246662286';
  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel) {
    console.warn(`[Alerta Preditivo] Canal de logs (${logChannelId}) não encontrado.`);
    return;
  }

  if (!executor || executor.bot) return;

  const userTag = executor.tag || `${executor.username}#${executor.discriminator}` || 'Desconhecido';

  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('🚨 Atividade Suspeita Detectada')
    .setDescription(`Ação suspeita detectada em **${guild?.name || 'Servidor desconhecido'}**`)
    .addFields(
      { name: 'Usuário', value: `${userTag} (\`${executor.id}\`)`, inline: false },
      { name: 'Ação', value: actionType, inline: true },
      { name: 'Ocorrências', value: `${count} em ${timeWindow}`, inline: true },
    )
    .setFooter({ text: 'Sistema de Inteligência Preditiva' })
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch((err) =>
    console.error(`[Alerta Preditivo] Falha ao enviar embed:`, err)
  );
}

module.exports = { sendAlert };
