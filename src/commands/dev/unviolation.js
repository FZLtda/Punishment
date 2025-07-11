'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { sendEmbed } = require('@utils/embedReply');
const { emojis, colors, bot } = require('@config');

module.exports = {
  name: 'unban',
  description: 'Remove o banimento global de um usuário.',
  usage: '${currentPrefix}unban <ID do usuário>',
  devOnly: true,

  async execute(message, args) {
    if (message.author.id !== bot.owner)
      return;

    const userId = args[0];

    if (!userId || !/^\d{17,19}$/.test(userId))
      return sendEmbed('yellow', message, 'Você deve fornecer um ID de usuário válido.');

    const alvo = await message.client.users.fetch(userId).catch(() => null);
    if (!alvo)
      return sendEmbed('yellow', message, 'Usuário não encontrado com esse ID.');

    const registro = await GlobalBan.findOne({ userId });
    if (!registro)
      return sendEmbed('yellow', message, 'Este usuário não está banido globalmente.');

    await GlobalBan.deleteOne({ userId });

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle(`${emojis.unban} Banimento Global Removido`)
      .setDescription(`O usuário **${alvo.tag}** (\`${alvo.id}\`) foi desbanido globalmente.`)
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
