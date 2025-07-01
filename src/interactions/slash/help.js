const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { buildHelpPages } = require('@utils/helpBuilder');
const { paginate } = require('@utils/paginator');
const { emojis, colors } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe informações sobre os comandos.')
    .addStringOption(opt =>
      opt.setName('comando').setDescription('Ver detalhes de um comando')
    ),

  async execute(interaction) {
    const nome = interaction.options.getString('comando');
    const comandos = interaction.client.slashCommands;

    if (nome) {
      const cmd = comandos.get(nome.toLowerCase());
      if (!cmd) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({ name: 'Comando não encontrado.', iconURL: emojis.attention })],
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle(`${cmd.data.name}`)
        .setDescription(cmd.data.description || 'Sem descrição.')
        .setFooter({
          text: 'Punishment • Help',
          iconURL: interaction.client.user.displayAvatarURL()
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const pages = buildHelpPages(comandos, {
      EmbedBuilder,
      colors,
      emojis,
      clientAvatar: interaction.client.user.displayAvatarURL()
    });

    return paginate(interaction, pages, { timeout: 60_000 });
  }
};
