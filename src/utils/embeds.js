'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

// Emojis de status
const successEmoji   = emojis?.successEmoji   ?? '';
const errorIcon      = emojis?.errorIcon      ?? '';
const attentionIcon  = emojis?.attentionIcon  ?? '';

/**
 * Gera uma embed de sucesso padrão
 * @param {Object} params
 * @param {string} [params.titulo] - Título da embed
 * @param {string} params.descricao - Descrição principal
 * @param {User} [params.autor] - Autor opcional (para footer)
 * @param {Array} [params.campos] - Campos adicionais
 * @param {string} [params.thumbnail] - Thumbnail opcional
 */
function embedSucesso({ titulo = `${successEmoji} Sucesso`, descricao, autor, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descricao)
    .setColor(colors.green)
    .setTimestamp();

  if (autor?.username && autor?.displayAvatarURL) {
    embed.setFooter({
      text: autor.username,
      iconURL: autor.displayAvatarURL({ dynamic: true })
    });
  }

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

/**
 * Gera uma embed de erro com o texto no autor
 * @param {Object} params
 * @param {string} params.descricao - Mensagem de erro
 * @param {Array} [params.campos] - Campos adicionais
 * @param {string} [params.thumbnail] - Thumbnail opcional
 */
function embedErro({ descricao, campos = [], thumbnail }) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setTimestamp()
    .setAuthor({ name: descricao, iconURL: errorIcon });

  if (campos.length) embed.addFields(...campos);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

/**
 * Gera uma embed de aviso com o texto no autor
 * @param {Object} params
 * @param {string} params.descricao - Mensagem de atenção
 * @param {Array} [params.campos] - Campos adicionais
 * @param {string} [params.thumbnail] - Thumbnail opcional
 */
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
