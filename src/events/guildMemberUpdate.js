const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember) {
  
    const oldBoost = oldMember.premiumSince;
    const newBoost = newMember.premiumSince;

    if (!oldBoost && newBoost) {
      const boostChannelId = '1325172777501851708';
      const channel = newMember.guild.channels.cache.get(boostChannelId);
      if (!channel) return;

      const botPermissions = channel.permissionsFor(newMember.guild.members.me);
      if (!botPermissions?.has(PermissionsBitField.Flags.SendMessages)) return;

      const totalBoosts = newMember.guild.premiumSubscriptionCount;

      const embed = new EmbedBuilder()
        .setTitle('Novo Impulsionador!')
        .setDescription(`Muito obrigado pelo seu impulso, ${newMember}!`)
        .addFields(
          { name: 'Total de Boosts no Servidor', value: `${totalBoosts}`, inline: true },
          { name: 'Apoio Incrível', value: `Seu apoio ajuda o servidor a crescer!`, inline: false }
        )
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setColor(0xA020F0)
        .setFooter({ text: 'Servidor impulsionado com sucesso!' })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  }
};
