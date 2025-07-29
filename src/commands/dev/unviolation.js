'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { sendWarning } = require('@utils/embedWarning');
const { emojis, colors, bot } = require('@config');

module.exports = {
  name: 'unviolation',
  description: 'Remove o banimento global de um usuário.',
  usage: '${currentPrefix}unviolation <ID do usuário>',
  deleteMessage: true,
  devOnly: true,

  async execute(message, args) {
    if (message.author.id !== bot.owner)
      return;

    const userId = args[0];

    if (!userId || !/^\d{17,19}$/.test(userId))
      return sendWarning(message, 'Você deve fornecer um ID de usuário válido.');

    const alvo = await message.client.users.fetch(userId).catch(() => null);
    if (!alvo)
      return sendWarning(message, 'Usuário não encontrado com esse ID.');

    const registro = await GlobalBan.findOne({ userId });
    if (!registro)
      return sendWarning(message, 'Este usuário não está banido globalmente.');

    await GlobalBan.deleteOne({ userId });

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle(`${emojis.unban} Banimento Global Removido`)
      .setDescription(`**${alvo.tag}** (\`${alvo.id}\`) foi desbanido globalmente.`)
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
