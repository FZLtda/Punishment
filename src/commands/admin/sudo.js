const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const { getPrefix } = require('../../utils/prefixUtils');

module.exports = {
  name: 'sudo',
  description: 'Executa um comando como se fosse outro usuário.',
  usage: '${currentPrefix}sudo @usuário <comando> [args]',
  userPermissions: ['Administrator'],
  botPermissions: [],
  deleteMessage: true,

  async execute(message, args) {

    if (message.author.id !== '1006909671908585586') return;
    
    const membro = message.mentions.members.first();
    if (!membro) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: 'Você precisa mencionar um usuário para executar o comando como ele.', iconURL: icon_attention });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    args.shift();
    const comandoNome = args.shift()?.toLowerCase();
    if (!comandoNome) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: 'Você precisa fornecer o nome do comando que deseja executar.', iconURL: icon_attention });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const comando = message.client.commands.get(comandoNome);
    if (!comando) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: `O comando "${comandoNome}" não foi encontrado.`, iconURL: icon_attention });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    try {
      const fakeMessage = {
        ...message,
        author: membro.user,
        member: membro,
        content: `${message.client.prefix}${comandoNome} ${args.join(' ')}`,
        reply: message.reply.bind(message),
        channel: message.channel,
        guild: message.guild,
        client: message.client
      };

      const options = {
        getPrefix: await getPrefix(message.guildId)
      };

      await comando.execute(fakeMessage, args, options);
    } catch (err) {
      console.error(err);
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: 'Não foi possível executar o comando como outro usuário devido a um erro.', iconURL: icon_attention });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  },
};
