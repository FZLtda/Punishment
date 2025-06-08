const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'restart',
  description: 'Reinicia o bot.',
  usage: '${currentPrefix}restart',
  userPermissions: ['Administrator'],
  botPermissions: [],
  deleteMessage: true,

  async execute(message) {
    if (message.author.id !== '1006909671908585586') {
      return message.reply({ content: 'Apenas o desenvolvedor pode executar esse comando.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setDescription('♻️ Reiniciando o bot...');

    await message.channel.send({ embeds: [embed] });

    setTimeout(() => {
      process.exit(0);
    }, 2000);
  },
};
