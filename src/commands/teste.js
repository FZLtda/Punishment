const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'teste',
  description: 'Exibe informações detalhadas do servidor.',
  usage: '${currentPrefix}serverinfo',
  async execute(message) {
    const { guild } = message;

    
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const forumChannels = guild.channels.cache.filter(c => c.type === 15).size;
    const announcementChannels = guild.channels.cache.filter(c => c.type === 5).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;

    
    const serverFeatures = [
      '📢 Announcement channels',
      '🤖 Automod',
      '🎨 Channel icon emojis generated',
      '🌍 Community',
      '✅ Creator accepted new terms',
      '💰 Creator monetizable provisional',
      '📌 Role subscriptions enabled',
      '📖 Server guide',
      '🎵 Soundboard'
    ];

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setAuthor({
        name: `${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true })
      })
      .setDescription(`👥 **${guild.memberCount}** Members   |  🚀 **${guild.premiumSubscriptionCount || 0}** Boosts\n🎭 **${guild.roles.cache.size} Roles**   |  😀 **${guild.emojis.cache.size} Emojis**\n📺 **${guild.channels.cache.size} Channels**  🎖️ <@${guild.ownerId}>`)
      .addFields(
        { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: false },
        { name: '📅 Server Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '📂 Channels', value: `📝 **Text Channels**: ${textChannels}\n💬 **Forum Channels**: ${forumChannels}\n📢 **Announcement Channels**: ${announcementChannels}\n📂 **Categories**: ${categories}`, inline: false },
        { name: '🛠️ Server Features (1/1)', value: serverFeatures.join('\n'), inline: false }
      )
      .setFooter({
        text: 'labsCore',
        iconURL: 'https://your-image-url.com/icon.png' 
      });

    return message.channel.send({ embeds: [embed] });
  },
};
