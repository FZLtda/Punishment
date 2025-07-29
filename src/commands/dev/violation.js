'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { sendWarning } = require('@utils/embedWarning');
const { emojis, colors, bot } = require('@config');

module.exports = {
  name: 'violation',
  description: 'Bane um usuário globalmente do uso do bot.',
  usage: '${currentPrefix}violation <ID do usuário> [motivo]',
  deleteMessage: true,
  devOnly: true,

  async execute(message, args) {
    if (message.author.id !== bot.ownerId)
      return;

    const userId = args[0];
    const motivo = args.slice(1).join(' ') || 'Sem motivo fornecido.';

    if (!userId || !/^\d{17,19}$/.test(userId))
      return sendWarning(message, 'Você deve fornecer um ID de usuário válido.');

    const alvo = await message.client.users.fetch(userId).catch(() => null);
    if (!alvo)
      return sendWarning(message, 'Usuário não encontrado com esse ID.');

    const jaBanido = await GlobalBan.findOne({ userId: alvo.id });
    if (jaBanido)
      return sendWarning(message, 'Este usuário já está banido globalmente.');

    await GlobalBan.create({
      userId: alvo.id,
      reason: motivo,
      bannedBy: message.author.id,
      createdAt: new Date()
    });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.ban} Banimento Global Aplicado`)
      .setDescription(`**${alvo.tag}** (\`${alvo.id}\`) foi banido(a) globalmente.`)
      .addFields({ name: 'Motivo', value: motivo })
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
