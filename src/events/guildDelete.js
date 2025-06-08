const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'guildDelete',

  async execute(guild, client) {
    const canalLogID = '1381065414246662286';
    const canalLog = await client.channels.fetch(canalLogID).catch(() => null);
    if (!canalLog || !canalLog.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle('Punishment Monitoramento')
      .setColor(yellow)
      .setDescription(`O bot foi removido de um servidor.`)
      .addFields(
        { name: 'Nome', value: guild.name || 'Desconhecido', inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: false }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
      .setFooter({ text: 'Punishment', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    canalLog.send({ embeds: [embed] }).catch(console.error);
  }
};
