'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

const successEmoji = emojis?.success || '';
const errorEmoji = emojis?.error || '';
const attentEmoji = emojis?.attent || '';

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

function embedErro({ titulo = `${errorEmoji} Erro`, descricao, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .setColor(colors.red)
    .setTimestamp();

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

function embedAviso({ titulo = `${attentEmoji} Aviso`, descricao, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .setColor(colors.yellow)
    .setTimestamp();

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

module.exports = {
  embedSucesso,
  embedErro,
  embedAviso,
};
