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
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
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

    if (!settings[guildId]) {
      settings[guildId] = {
        title: 'Verificação Necessária',
        description: 'Clique no botão abaixo para se verificar e obter acesso ao servidor.',
        color: '#fe3838',
        buttonText: 'Verificar',
        buttonEmoji: '<:emoji_34:1219815388921991259>',
        roleId: null,
        channelId: null,
        messageId: null,
      };
    }

    const guildConfig = settings[guildId];
    const interactionAuthor = interactionAuthors.get(interaction.message.id);

    if (interactionAuthor && interaction.user.id !== interactionAuthor) {
      return interaction.reply({
        content: '<:no:1122370713932795997> Apenas o autor do comando pode interagir com este sistema.',
        ephemeral: true,
      });
    }

    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const updateEmbed = async () => {
      const existingMessage = await interaction.channel.messages.fetch(guildConfig.messageId).catch(() => null);
      if (existingMessage) {
        const updatedEmbed = new EmbedBuilder()
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
            text: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await existingMessage.edit({ embeds: [updatedEmbed] });
      }
    };

    switch (interaction.customId) {
      case 'set_title':
        await interaction.followUp({ content: '<:emoji_29:1217939003626492026> Envie um novo título.' });
        await collectUserInput(interaction, (newValue) => {
          guildConfig.title = newValue;
        });
        break;

      case 'set_description':
        await interaction.followUp({ content: '<:emoji_29:1217939003626492026> Envie uma nova descrição.' });
        await collectUserInput(interaction, (newValue) => {
          guildConfig.description = newValue;
        });
        break;

      case 'set_color':
        await interaction.followUp({
          content: '<:emoji_29:1217939003626492026> Envie uma cor em hexadecimal.',
        });
        await collectUserInput(interaction, (newValue) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
            guildConfig.color = newValue;
          } else {
            interaction.followUp({
              content: '<:no:1122370713932795997> A cor fornecida é inválida.',
              ephemeral: true,
            });
          }
        });
        break;

      case 'set_button':
        await interaction.followUp({
          content: '<:emoji_29:1217939003626492026> Envie um nome para o botão.',
        });
        await collectUserInput(interaction, (newValue) => {
          const emojiRegex = /<a?:\w+:\d+>|[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{1FA70}-\u{1FAFF}\u{2700}-\u{27BF}]/u;

          const emojiMatch = newValue.match(emojiRegex);
          const buttonEmoji = emojiMatch ? emojiMatch[0] : null;
          const buttonText = newValue.replace(emojiRegex, '').trim() || 'Verificar';

          guildConfig.buttonEmoji = buttonEmoji || '';
          guildConfig.buttonText = buttonText;
        });
        break;

      case 'set_role':
        await interaction.followUp({ content: '<:emoji_29:1217939003626492026> Mencione um cargo válido.' });
        await collectUserInput(interaction, (newValue) => {
          const role = interaction.guild.roles.cache.get(newValue.replace(/[<@&>]/g, ''));
          if (role) guildConfig.roleId = role.id;
        });
        break;

      case 'set_channel':
        await interaction.followUp({ content: '<:emoji_29:1217939003626492026> Mencione um canal válido.' });
        await collectUserInput(interaction, (newValue) => {
          const channel = interaction.guild.channels.cache.get(newValue.replace(/[<#>]/g, ''));
          if (channel) guildConfig.channelId = channel.id;
        });
        break;

      case 'post_system':
        const verifyEmbed = new EmbedBuilder()
          .setColor(guildConfig.color)
          .setTitle(guildConfig.title)
          .setDescription(guildConfig.description)
          .setFooter({
            text: 'Punishment',
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp();

        const buttonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel(guildConfig.buttonText)
            .setEmoji(guildConfig.buttonEmoji)
            .setStyle(ButtonStyle.Success)
        );

        const verifyChannel = interaction.guild.channels.cache.get(guildConfig.channelId);
        if (!verifyChannel) {
          return interaction.followUp({
            content: '<:no:1122370713932795997> O canal configurado não foi encontrado.',
          });
        }

        await verifyChannel.send({ embeds: [verifyEmbed], components: [buttonRow] });
        return interaction.followUp({
          content: '<:emoji_33:1219788320234803250> Sistema de verificação postado com sucesso!',
        });

      case 'verify_button':
        const role = interaction.guild.roles.cache.get(guildConfig.roleId);

        if (!role) {
          return interaction.followUp({
            content: '<:no:1122370713932795997> O cargo configurado não foi encontrado.',
            ephemeral: true,
          });
        }

        if (interaction.member.roles.cache.has(role.id)) {
          return interaction.followUp({
            content: '<:emoji_32:1219785390496677898> Você já foi verificado anteriormente.',
            ephemeral: true,
          });
        }

        await interaction.member.roles.add(role).catch((error) => {
          console.error('Erro ao adicionar cargo:', error);
          return interaction.followUp({
            content: '<:no:1122370713932795997> Ocorreu um erro ao tentar adicionar o cargo.',
            ephemeral: true,
          });
        });

        return interaction.followUp({
          content: '<:emoji_33:1219788320234803250> Você foi verificado com sucesso e recebeu o cargo!',
          ephemeral: true,
        });

      default:
        return interaction.reply({
          content: '<:no:1122370713932795997> Botão não configurado corretamente.',
          ephemeral: true,
        });
    }

    settings[guildId] = guildConfig;
    fs.writeFileSync(path, JSON.stringify(settings, null, 4));
    await updateEmbed();
  },
};

async function collectUserInput(interaction, updateCallback) {
  const filter = (m) => m.author.id === interaction.user.id;
  try {
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
    if (!collected.size) {
      return interaction.followUp({ content: 'Tempo esgotado para enviar a entrada.', ephemeral: true });
    }
    const newValue = collected.first().content;
    updateCallback(newValue);
    collected.first().delete().catch(() => null);
  } catch (error) {
    console.error('Erro no coletor:', error);
    return interaction.followUp({ content: 'Ocorreu um erro ao processar sua entrada.', ephemeral: true });
  }
}