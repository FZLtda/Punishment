const { EmbedBuilder } = require('discord.js');
const { icon_attention } = require('../config/emoji.json');
const { yellow } = require('../config/colors.json');
const fs = require('fs');
const path = './data/antispam.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

module.exports = {
  name: 'antispam',
  description: 'Ativa ou desativa o sistema de bloqueio de spam no servidor.',
  usage: '${currentPrefix}antispam [on/off]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,
    
  async execute(message, args) {

    if (!message.guild) {
      return message.reply('Este comando só pode ser usado em servidores.');
    }

    const guildId = message.guild.id;
    const option = args[0]?.toLowerCase();

    if (!['on', 'off'].includes(option)) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Uso incorreto! Use `.antispam on` para ativar ou `.antispam off` para desativar o sistema.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (option === 'on') {
      settings[guildId] = { enabled: true };
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('<:on:1232142357848260639> Antispam Ativado')
        .setDescription('O sistema de bloqueio de spam foi ativado neste servidor.')
        .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    if (option === 'off') {
      delete settings[guildId];
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle('<:emoji_51:1248416468819906721> Antispam Desativado')
        .setDescription('O sistema de bloqueio de spam foi desativado neste servidor.')
        .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  }
};
