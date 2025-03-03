const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'fakeban',
  description: 'Finge que baniu um membro do servidor.',
  usage: '${currentPrefix}fakeban <@usuário>',
  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const embedBan = new EmbedBuilder()
      .setTitle('<:1000046502:1340405550453887007> Punição aplicada')
      .setColor('Red')
      .setDescription(`${membro} (\`${membro.id}\`) foi banido(a)!`)
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const msg = await message.channel.send({ embeds: [embedBan], allowedMentions: { repliedUser: false } });

    setTimeout(() => {
      const embedTroll = new EmbedBuilder()
        .setTitle('😂 Pegadinha!')
        .setColor('Green')
        .setDescription(`${membro}, você não foi banido de verdade! Foi só uma trollagem!`)
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      msg.edit({ embeds: [embedTroll] });
    }, 5000);
  },
};
