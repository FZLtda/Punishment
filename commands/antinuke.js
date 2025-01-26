const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './data/antinuke.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

module.exports = {
  name: 'antinuke',
  description: 'Ativa ou desativa o sistema Anti-Nuke no servidor.',
  usage: '.antinuke [on/off]',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      return message.reply(
        '<:no:1122370713932795997> Uso incorreto! Use `.antinuke on` para ativar ou `.antinuke off` para desativar o sistema Anti-Nuke.'
      );
    }

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (option === 'on') {
      settings[guildId] = { enabled: true };
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('<:on:1232142357848260639> Anti-Nuke Ativado')
        .setDescription('O sistema Anti-Nuke foi ativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (option === 'off') {
      delete settings[guildId];
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('fe3838')
        .setTitle('<:emoji_51:1248416468819906721> Anti-Nuke Desativado')
        .setDescription('O sistema Anti-Nuke foi desativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }
  },
};