const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require('discord.js');
const fs = require('fs');
const path = './data/verifyConfig.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

let interactionAuthors = new Map();

module.exports = {
  name: 'verify',
  description: 'Configura e gerencia o sistema de verificação no servidor.',
  usage: 'verify',
  permissions: 'Administrador',
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
        });

      return message.reply({ embeds: [embedErro] });
    }

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    const guildId = message.guild.id;

    const defaultConfig = {
      title: 'Verificação Necessária',
      description: 'Clique no botão abaixo para se verificar e obter acesso ao servidor.',
      color: '#fe3838',
      buttonText: 'Verificar',
      buttonEmoji: '<:emoji_34:1219815388921991259>',
      roleId: null,
      channelId: null,
      messageId: null,
    };

    const guildConfig = settings[guildId] || defaultConfig;

    const embed = new EmbedBuilder()
      .setColor(guildConfig.color)
      .setTitle(guildConfig.title)
      .setDescription(
        `**Descrição Atual:**\n${guildConfig.description}\n\n**Cor Atual:**\n${guildConfig.color}\n\n**Botão Atual:**\n${guildConfig.buttonEmoji} ${guildConfig.buttonText}\n\n**Cargo Atual:**\n${
          guildConfig.roleId ? `<@&${guildConfig.roleId}>` : 'Nenhum cargo configurado'
        }\n\n**Canal Atual:**\n${
          guildConfig.channelId ? `<#${guildConfig.channelId}>` : 'Nenhum canal configurado'
        }\n\nUse os botões abaixo para personalizar o sistema ou postar no canal de verificação.`
      )
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('set_title')
        .setLabel('Título')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>'),
      new ButtonBuilder()
        .setCustomId('set_description')
        .setLabel('Descrição')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>'),
      new ButtonBuilder()
        .setCustomId('set_color')
        .setLabel('Cor')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('set_button')
        .setLabel('Botão')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>'),
      new ButtonBuilder()
        .setCustomId('set_role')
        .setLabel('Cargo')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>'),
      new ButtonBuilder()
        .setCustomId('set_channel')
        .setLabel('Canal')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:emoji_29:1217939003626492026>')
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('post_system')
        .setLabel('Postar Sistema')
        .setStyle(ButtonStyle.Success)
        .setEmoji('<:emoji_34:1219815388921991259>')
    );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row1, row2, row3] });
    guildConfig.messageId = sentMessage.id;
    settings[guildId] = guildConfig;
    fs.writeFileSync(path, JSON.stringify(settings, null, 4));

    interactionAuthors.set(sentMessage.id, message.author.id);
  },

  async handleInteraction(interaction) {
    if (!interaction.isButton()) return;

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    const guildId = interaction.guild.id;

    if (!settings[guildId]) return;

    const interactionAuthor = interactionAuthors.get(interaction.message.id);

    if (interactionAuthor && interaction.user.id !== interactionAuthor) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não pode interagir com isso.',
          iconURL: 'http://bit.ly/4aIyY9j'
        });

      return interaction.reply({ embeds: [embedErro], ephemeral: true });
    }
  }
};

async function collectUserInput(interaction, updateCallback) {
  const filter = (m) => m.author.id === interaction.user.id;
  try {
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
    if (!collected.size) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Tempo esgotado para enviar a entrada.',
          iconURL: 'http://bit.ly/4aIyY9j'
        });

      return interaction.followUp({ embeds: [embedErro], ephemeral: true });
    }

    const newValue = collected.first().content;
    updateCallback(newValue);
    collected.first().delete().catch(() => null);
  } catch (error) {
    console.error('Erro no coletor:', error);

    const embedErro = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
        name: 'Ocorreu um erro ao processar sua entrada.',
        iconURL: 'http://bit.ly/4aIyY9j'
      });

    return interaction.followUp({ embeds: [embedErro], ephemeral: true });
  }
}
