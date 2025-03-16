const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'teste',
  description: 'Exibe informações do servidor.',
  usage: '${currentPrefix}serverinfo',
  async execute(message) {
    const { guild } = message;

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`👥 **${guild.memberCount}** Members   |  🚀 **${guild.premiumSubscriptionCount || 0}** Boosts`)
      .addFields(
        { name: '📌 ID do Servidor', value: `\`${guild.id}\``, inline: false },
        { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '#️⃣ Canais', value: `📝 **Texto:** ${guild.channels.cache.filter(c => c.type === 0).size}\n📢 **Anúncios:** ${guild.channels.cache.filter(c => c.type === 5).size}\n📂 **Categorias:** ${guild.channels.cache.filter(c => c.type === 4).size}`, inline: false },
        { name: '🛠️ Recursos do Servidor', value: `✅ Announcement Channels\n✅ Automod\n✅ Emojis Personalizados\n✅ Comunidade\n✅ Sistema de Assinaturas de Cargos`, inline: false }
      )
      .setFooter({ text: 'labsCore', iconURL: 'https://your-image-url.com/icon.png' });

    return message.channel.send({ embeds: [embed] });
  },
};
