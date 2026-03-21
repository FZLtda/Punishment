"use strict";

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { bot, colors, emojis } = require("@config");
const categories = require("@helpers/helpCategories");
const { sendWarning } = require("@embeds/embedWarning");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mostra todos os comandos disponíveis e como utilizá-los."),

  async execute(interaction) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return sendWarning(interaction, "Nenhuma categoria de ajuda foi encontrada.");
    }

    const options = categories
      .filter(cat =>
        cat &&
        typeof cat.id === "string" &&
        typeof cat.name === "string" &&
        typeof cat.description === "string"
      )
      .map(cat => ({
        label: cat.name,
        description: cat.description,
        value: cat.id,
        emoji: cat.emoji,
      }));

    if (options.length === 0) {
      return sendWarning(interaction, "Nenhuma categoria válida foi encontrada.");
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${bot.name} - Central de Ajuda`,
        iconURL: emojis.helpIcon,
      })
      .setColor(colors.red)
      .setDescription(
        [
          "```",
          `${bot.name} - Categorias`,
          "```",
          ">>> Escolha uma categoria abaixo para ver os comandos disponíveis, como utilizá-los e quais permissões são necessárias.",
          "",
          "Projetado para tornar a moderação do seu servidor mais simples e eficiente.",
        ].join("\n")
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help-category")
      .setPlaceholder("Explorar categorias")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(options);

    const menuRow = new ActionRowBuilder().addComponents(menu);

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Me Adicione")
        .setStyle(ButtonStyle.Link)
        .setURL(
          "https://discord.com/oauth2/authorize?client_id=1155843839932764253&permissions=8&integration_type=0&scope=applications.commands+bot"
        ),
      new ButtonBuilder()
        .setCustomId("help_close")
        .setLabel("Fechar")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      embeds: [embed],
      components: [menuRow, buttonsRow],
      flags: 1 << 6,
    });
  },
};
