const { EmbedBuilder } = require('discord.js');
const { red } = require('../../config/colors.json');
const moment = require('moment-timezone');

module.exports = {
  name: 'serverinfo',
  description: 'Mostra informações detalhadas sobre o servidor.',
  usage: '${currentPrefix}serverinfo',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message) {
    const guild = message.guild;

    const createdAt = moment(guild.createdAt)
      .tz('America/Sao_Paulo')
      .format('DD/MM/YYYY [às] HH:mm:ss');

    const owner = await guild.fetchOwner();

    const memberCount = guild.memberCount;
    const botsCount = guild.members.cache.filter((member) => member.user.bot).size;
    const humansCount = memberCount - botsCount;

    const textChannels = guild.channels.cache.filter((channel) => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 2).size;
    const categories = guild.channels.cache.filter((channel) => channel.type === 4).size;

    const boosts = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;

    const emojiCount = guild.emojis.cache.size;
    const stickerCount = guild.stickers.cache.size;

    const rulesChannel = guild.rulesChannel ? `<#${guild.rulesChannel.id}>` : 'Nenhum';

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true, size: 1024 }) || null,
      })
      .setColor(red)
      .addFields(
        { name: 'Nome', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dono', value: `${owner.displayName} (\`${owner.user.id}\`)`, inline: true },
        { name: 'Criado em', value: createdAt, inline: true },
        { name: 'Canal de Regras', value: rulesChannel, inline: true },
        { name: 'Membros', value: `Total: ${memberCount}\nHumanos: ${humansCount}\nBots: ${botsCount}`, inline: true },
        { name: 'Canais', value: `Texto: ${textChannels}\nVoz: ${voiceChannels}\nCategorias: ${categories}`, inline: true },
        { name: 'Boosts', value: `Nível: ${boostLevel}\nTotal: ${boosts}`, inline: true },
        { name: 'Emojis e Stickers', value: `Emojis: ${emojiCount}\nStickers: ${stickerCount}`, inline: true }
      )
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
};
