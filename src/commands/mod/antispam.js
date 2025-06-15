const { EmbedBuilder } = require('discord.js');
const { icon_attention } = require('../../config/emoji.json');
const { yellow } = require('../../config/colors.json');
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../../data');
const dataPath = path.join(dataDir, 'antispam.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));

module.exports = {
  name: 'antispam',
  description: 'Ativa ou desativa o sistema de bloqueio de spam no servidor.',
  usage: '${currentPrefix}antispam [on/off]',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({
              name: 'Use .antispam on para ativar ou .antispam off para desativar.',
              iconURL: icon_attention,
            })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch {
      settings = {};
      fs.writeFileSync(dataPath, JSON.stringify({}, null, 4));
    }

    option === 'on'
      ? settings[guildId] = { enabled: true }
      : delete settings[guildId];

    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 4));

    const embed = new EmbedBuilder()
      .setColor(option === 'on' ? '#2ecc71' : '#fe3838')
      .setTitle(option === 'on'
        ? '<:on:1232142357848260639> Antispam Ativado'
        : '<:emoji_51:1248416468819906721> Antispam Desativado')
      .setDescription(`O sistema de bloqueio de spam foi ${option === 'on' ? 'ativado' : 'desativado'} neste servidor.`)
      .setFooter({
        text: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};
