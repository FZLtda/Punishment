const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TERMS } = require('../config/settings.json');
const { check } = require('../config/emoji.json');
const db = require('../data/database');

async function checkTerms(context) {
  const user = context.author || context.user;

  if (!user) {
    console.warn('INFO: Contexto sem usuário associado no checkTerms.');
    return false;
  }

  const userId = user.id;

  const userAccepted = db.prepare('SELECT * FROM terms WHERE user_id = ?').get(userId);
  if (userAccepted) return true;

  const embed = new EmbedBuilder()
    .setColor('#FE3838')
    .setTitle('Termos de Uso')
    .setDescription(
      'Antes de seguir, precisamos que você aceite nossos Termos de Uso. Leia-os clicando em **Ler Termos** e, se estiver de acordo, clique em **Aceitar Termos** para continuar aproveitando o Punishment!'
    )
    .setFooter({ text: 'Punishment by FuncZero', iconURL: context.client.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_terms')
      .setLabel('Aceitar Termos')
      .setStyle(ButtonStyle.Success)
      .setEmoji(`${check}`),
    new ButtonBuilder()
      .setLabel('Ler Termos')
      .setStyle(ButtonStyle.Link)
      .setURL(`${TERMS}`)
  );

  if (context.reply) {
    await context.reply({ embeds: [embed], components: [row], ephemeral: true, allowedMentions: { repliedUser: false } });
  } else if (context.channel) {
    await context.channel.send({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });
  }

  return false;
}

module.exports = { checkTerms };