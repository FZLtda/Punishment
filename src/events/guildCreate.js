const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'guildCreate',

  async execute(guild, client) {
    const canalLogID = '1381065414246662286';
    const canalLog = await client.channels.fetch(canalLogID).catch(() => null);

    if (!canalLog || !canalLog.isTextBased()) return;

    const dono = await guild.fetchOwner().catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('Punishment Monitoramento')
      .setColor(yellow)
      .setDescription(`O bot foi adicionado a um novo servidor!`)
      .addFields(
        { name: '🛡 Servidor', value: `${guild.name}`, inline: true },
        { name: '👑 Dono', value: `${dono ? dono.user.tag : 'Desconhecido'}`, inline: true },
        { name: '🆔 ID', value: `${guild.id}`, inline: true },
        { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
        { name: '🌍 Total de Servidores', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: 'Punishment', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    canalLog.send({ embeds: [embed] }).catch(console.error);
  }
};
