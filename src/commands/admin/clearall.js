const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../../utils/moderationUtils');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'clearall',
  description: 'Apaga até 100 mensagens do canal atual (restrito ao proprietário).',
  usage: '${currentPrefix}clearall',
  userPermissions: [],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {

    if (message.author.id !== '1006909671908585586') return;

    try {
      const mensagens = await message.channel.messages.fetch({ limit: 100 });
      const mensagensParaApagar = mensagens.filter((msg) => !msg.pinned);

      const apagadas = await message.channel.bulkDelete(mensagensParaApagar, true);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'ClearAll',
        'Todos',
        `${apagadas.size} mensagens apagadas (clearall)`
      );

      const feedbackMessage = await message.channel.send(
        `<:1000042885:1336044571125354496> ${apagadas.size} mensagens foram apagadas com sucesso.`
      );

      setTimeout(() => feedbackMessage.delete().catch(() => null), 4000);
    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível apagar as mensagens devido a um erro.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
