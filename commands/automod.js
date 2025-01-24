const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: 'automod',
  description: 'Gerencie o sistema de AutoMod do servidor de forma interativa.',
  async execute(message) {
    if (!message.member.permissions.has('Administrator')) {
      const embed = new EmbedBuilder()
        .setDescription('⚠️ Você precisa de permissões de administrador para usar este comando.')
        .setColor('Red');
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Gerenciamento de AutoMod')
      .setDescription(
        'Clique nos botões abaixo para gerenciar as regras do AutoMod:\n\n' +
          '🔹 **Criar Regra:** Crie uma nova regra.\n' +
          '🔹 **Adicionar Palavras:** Adicione palavras a uma regra existente.\n' +
          '🔹 **Excluir Regra:** Remova uma regra específica.\n' +
          '🔹 **Excluir Palavras:** Remova palavras de uma regra.\n' +
          '🔹 **Ver Regras:** Veja todas as regras configuradas.'
      )
      .setColor('Blue')
      .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_rule')
        .setLabel('Criar Regra')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('add_word')
        .setLabel('Adicionar Palavras')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('delete_rule')
        .setLabel('Excluir Regra')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('remove_word')
        .setLabel('Excluir Palavras')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('view_rules')
        .setLabel('Ver Regras')
        .setStyle(ButtonStyle.Primary)
    );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

    const collector = sentMessage.createMessageComponentCollector({
      time: 60000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        const embed = new EmbedBuilder()
          .setDescription('⚠️ Apenas quem executou o comando pode interagir com os botões.')
          .setColor('Red');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Defer a interação para evitar o erro InteractionNotReplied
      await interaction.deferReply({ ephemeral: true });

      switch (interaction.customId) {
        case 'create_rule':
          await handleCreateRule(interaction);
          break;

        case 'add_word':
          await handleAddWord(interaction);
          break;

        case 'delete_rule':
          await handleDeleteRule(interaction);
          break;

        case 'remove_word':
          await handleRemoveWord(interaction);
          break;

        case 'view_rules':
          await handleViewRules(interaction);
          break;

        default:
          const errorEmbed = new EmbedBuilder()
            .setDescription('❌ Botão inválido.')
            .setColor('Red');
          await interaction.followUp({ embeds: [errorEmbed] });
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] }).catch(() => null);
    });
  },
};

async function handleCreateRule(interaction) {
  const embed = new EmbedBuilder()
    .setDescription('📝 Digite o nome da nova regra:')
    .setColor('Yellow');
  await interaction.followUp({ embeds: [embed] });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (collected) => {
    const ruleName = collected.content.trim();
    if (!ruleName) {
      const errorEmbed = new EmbedBuilder()
        .setDescription('⚠️ O nome da regra não pode ser vazio.')
        .setColor('Red');
      return interaction.followUp({ embeds: [errorEmbed] });
    }

    try {
      await interaction.guild.autoModerationRules.create({
        name: ruleName,
        creatorId: interaction.user.id,
        eventType: 1,
        triggerType: 1,
        triggerMetadata: { keywordFilter: [] },
        actions: [
          {
            type: 1,
            metadata: { channel: interaction.channel.id },
          },
        ],
        enabled: true,
      });

      const successEmbed = new EmbedBuilder()
        .setDescription(`✅ Regra criada com sucesso: **${ruleName}**.`)
        .setColor('Green');
      await interaction.followUp({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setDescription('❌ Ocorreu um erro ao criar a regra.')
        .setColor('Red');
      await interaction.followUp({ embeds: [errorEmbed] });
    }
  });
}

async function handleViewRules(interaction) {
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();

    if (rules.size === 0) {
      const noRulesEmbed = new EmbedBuilder()
        .setDescription('⚠️ Não há regras de AutoMod configuradas no servidor.')
        .setColor('Yellow');
      return interaction.followUp({ embeds: [noRulesEmbed] });
    }

    const embeds = rules.map((rule) => {
      const keywords = rule.triggerMetadata.keywordFilter.join(', ') || 'Nenhuma';
      return new EmbedBuilder()
        .setTitle(`📜 Regra: ${rule.name}`)
        .addFields(
          { name: '🔑 ID', value: `\`${rule.id}\``, inline: true },
          { name: '📚 Palavras-Chave', value: keywords, inline: true },
          { name: '📅 Criado em', value: `<t:${Math.floor(new Date(rule.createdTimestamp) / 1000)}:R>` }
        )
        .setColor('Blue');
    });

    for (const embed of embeds) {
      await interaction.followUp({ embeds: [embed] });
    }
  } catch (error) {
    console.error(error);
    const errorEmbed = new EmbedBuilder()
      .setDescription('❌ Ocorreu um erro ao listar as regras.')
      .setColor('Red');
    await interaction.followUp({ embeds: [errorEmbed] });
  }
}