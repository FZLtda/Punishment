const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'nickname',
  description: 'Altera o apelido de um membro no servidor.',
  usage: '${currentPrefix}nickname <@usuário> <novo apelido>',
  userPermissions: ['ManageNicknames'],
  botPermissions: ['ManageNicknames'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const apelido = args.slice(1).join(' ');

    if (!membro) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Mencione um usuário válido para alterar o apelido.',
          iconURL: 'https://bit.ly/43PItSI'
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!apelido) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você deve fornecer um novo apelido.',
          iconURL: 'https://bit.ly/43PItSI'
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!membro.manageable) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não é possível alterar o apelido deste usuário.',
          iconURL: 'https://bit.ly/43PItSI'
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.setNickname(apelido);

      const embed = new EmbedBuilder()
        .setTitle('<:Editar:1355731990069295214> Apelido alterado')
        .setColor('Green')
        .setDescription(`O apelido de ${membro} foi alterado com sucesso!`)
        .addFields(
          { name: 'Novo apelido', value: `\`${apelido}\`` },
          { name: 'Usuário', value: `${membro} (\`${membro.id}\`)` }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Não foi possível alterar o apelido devido a um erro.',
          iconURL: `${icon_attention}`
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
