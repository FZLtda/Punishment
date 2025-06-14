const { EmbedBuilder } = require('discord.js');
const { icon_attention } = require('../config/emoji.json');
const { yellow, red, green } = require('../config/colors.json');
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, './data/antispam.json');

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({}));
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
      return message.reply({
        content: 'Este comando só pode ser usado em servidores.',
        allowedMentions: { repliedUser: false },
      });
    }

    const guildId = message.guild.id;
    const option = args[0]?.toLowerCase();

    if (!['on', 'off'].includes(option)) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Uso incorreto! Use `.antispam on` para ativar ou `.antispam off` para desativar o sistema.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      return message.reply({
        content: 'Erro ao ler as configurações do sistema antispam.',
        allowedMentions: { repliedUser: false },
      });
    }

    if (option === 'on') {
      settings[guildId] = { enabled: true };

      try {
        fs.writeFileSync(dataPath, JSON.stringify(settings, null, 4));
      } catch (err) {
        return message.reply({
          content: 'Erro ao salvar as configurações do sistema antispam.',
          allowedMentions: { repliedUser: false },
        });
      }

      const embed = new EmbedBuilder()
        .setColor(green)
        .setTitle('<:on:1232142357848260639> Antispam Ativado')
        .setDescription('O sistema de bloqueio de spam foi ativado neste servidor.')
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    if (option === 'off') {
      delete settings[guildId];

      try {
        fs.writeFileSync(dataPath, JSON.stringify(settings, null, 4));
      } catch (err) {
        return message.reply({
          content: 'Erro ao atualizar as configurações do sistema antispam.',
          allowedMentions: { repliedUser: false },
        });
      }

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('<:emoji_51:1248416468819906721> Antispam Desativado')
        .setDescription('O sistema de bloqueio de spam foi desativado neste servidor.')
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  },
};
