const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'automod',
  description: 'Gerencie o sistema de AutoMod do servidor de forma interativa.',
  async execute(message) {
    // Verifica permissões
    if (!message.member.permissions.has('Administrator')) {
      const embed = new EmbedBuilder()
        .setDescription('⚠️ Você precisa de permissões de administrador para usar este comando.')
        .setColor('Red');
      return message.reply({ embeds: [embed] });
    }

    // Cria o embed principal
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

    // Adiciona os botões
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_rule').setLabel('Criar Regra').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('add_word').setLabel('Adicionar Palavras').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('delete_rule').setLabel('Excluir Regra').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('remove_word').setLabel('Excluir Palavras').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('view_rules').setLabel('Ver Regras').setStyle(ButtonStyle.Primary)
    );

    // Envia a mensagem com os botões
    const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

    // Cria o coletor de interações
    const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      // Permissão para usar os botões
      if (interaction.user.id !== message.author.id) {
        const embed = new EmbedBuilder()
          .setDescription('⚠️ Apenas quem executou o comando pode interagir com os botões.')
          .setColor('Red');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      // Lida com cada botão
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

// Função para criar regra
async function handleCreateRule(interaction) {
  const embed = new EmbedBuilder()
    .setDescription('📝 Digite o nome da nova regra:')
    .setColor('Yellow');
  await interaction.followUp({ embeds: [embed] });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

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
        actions: [{ type: 1, metadata: { channel: interaction.channel.id } }],
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

// Função para visualizar regras
async function handleViewRules(interaction) {
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();

    if (rules.size === 0) {
      const noRulesEmbed = new EmbedBuilder()
        .setDescription('⚠️ Não há regras de AutoMod configuradas no servidor.')
        .setColor('Yellow');
      return interaction.followUp({ embeds: [noRulesEmbed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Regras de AutoMod Configuradas')
      .setDescription('Aqui estão as regras configuradas no AutoMod:')
      .setColor('Blue');

    rules.forEach((rule) => {
      const keywords = rule.triggerMetadata.keywordFilter?.join(', ') || 'Nenhuma';
      embed.addFields({ name: `📜 ${rule.name}`, value: `**ID:** \`${rule.id}\`\n**Palavras:** ${keywords}` });
    });

    await interaction.followUp({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    const errorEmbed = new EmbedBuilder()
      .setDescription('❌ Ocorreu um erro ao listar as regras.')
      .setColor('Red');
    await interaction.followUp({ embeds: [errorEmbed] });
  }
}