const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { yellow } = require('@config/colors');
const { icon_attention } = require('@config/emoji');

module.exports = {
  name: 'guildCreate',

  async execute(guild, client) {
    const canalLogID = '1381065414246662286';
    const canalLog = await client.channels.fetch(canalLogID).catch(() => null);
    if (!canalLog || !canalLog.isTextBased()) return;

    let dono = 'Desconhecido';
    try {
      const fetchedOwner = await guild.fetchOwner();
      dono = `${fetchedOwner.user.tag} (\`${fetchedOwner.id}\`)`;
    } catch (err) {
      console.warn(`[Punishment] Não foi possível obter o dono do servidor ${guild.name}.`);
    }

    const embed = new EmbedBuilder()
      .setTitle('Punishment Monitoramento')
      .setColor(yellow)
      .setDescription(`O bot foi adicionado em um novo servidor!`)
      .addFields(
        { name: 'Nome', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dono', value: dono, inline: false },
        { name: 'Membros', value: `${guild.memberCount}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: 'Canais / Cargos', value: `${guild.channels.cache.size} / ${guild.roles.cache.size}`, inline: true },
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: false }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
      .setFooter({ text: 'Punishment', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    if (
      canalLog.permissionsFor(client.user)?.has(PermissionsBitField.Flags.SendMessages)
    ) {
      canalLog.send({ embeds: [embed] }).catch(console.error);
    }
  }
};
