'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

const successEmoji = emojis?.success || '';
const errorEmoji = emojis?.error || '';
const attentEmoji = emojis?.attent || '';
const errorIcon = emojis?.erroricon || '';
const attentionIcon = emojis?.attention || '';

function embedSucesso({ titulo = `${successEmoji} Sucesso`, descricao, autor, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .setColor(colors.green)
    .setTimestamp();

  if (autor) embed.setFooter({ text: autor.username, iconURL: autor.displayAvatarURL({ dynamic: true }) });
  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

function embedErro({ descricao, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setTimestamp()
    .setAuthor({ name: descricao, iconURL: errorIcon });

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

function embedAviso({ descricao, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setTimestamp()
    .setAuthor({ name: descricao, iconURL: attentionIcon });

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

module.exports = {
  embedSucesso,
  embedErro,
  embedAviso,
};
