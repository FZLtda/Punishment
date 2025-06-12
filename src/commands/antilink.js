const { EmbedBuilder } = require('discord.js');
const { icon_attention } = require('../config/emoji.json');
const { yellow } = require('../config/colors.json');
const fs = require('fs');
const path = './data/antilink.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

module.exports = {
  name: 'antilink',
  description: 'Ativa ou desativa o sistema de bloqueio de links no servidor.',
  usage: '${currentPrefix}antilink [on/off]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,
    
  async execute(message, args) {
    
    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({ 
          name: 'Uso incorreto! Use `.antilink on` para ativar ou `.antilink off` para desativar.', 
          iconURL: `${icon_attention}` });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
      settings = {};
      fs.writeFileSync(path, JSON.stringify({}, null, 4));
    }

    if (option === 'on') {
      settings[guildId] = { enabled: true };
    } else {
      delete settings[guildId];
    }

    fs.writeFileSync(path, JSON.stringify(settings, null, 4));

    const embed = new EmbedBuilder()
      .setColor(option === 'on' ? '#2ecc71' : '#fe3838')
      .setTitle(option === 'on' ? '<:on:1232142357848260639> Antilink Ativado' : '<:emoji_51:1248416468819906721> Antilink Desativado')
      .setDescription(`O sistema de bloqueio de links foi ${option === 'on' ? 'ativado' : 'desativado'} neste servidor.`)
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};
