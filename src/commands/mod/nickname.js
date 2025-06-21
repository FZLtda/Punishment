const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { colors, emojis } = require('@config');

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
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Mencione um usuário válido para alterar o apelido.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!apelido) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Você deve fornecer um novo apelido.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!membro.manageable) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não é possível alterar o apelido deste usuário.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.setNickname(apelido);

      const embed = new EmbedBuilder()
        .setTitle('<:sucesso:1358918549846098201> Apelido alterado')
        .setColor(colors.green)
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
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível alterar o apelido devido a um erro.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
