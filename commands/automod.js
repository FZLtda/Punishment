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
      return message.reply('⚠️ Você precisa de permissões de administrador para usar este comando.');
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
        return interaction.reply({
          content: '⚠️ Apenas quem executou o comando pode interagir com os botões.',
          flags: 64,
        });
      }

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
          await interaction.reply({ content: '❌ Botão inválido.', flags: 64 });
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] }).catch(() => null);
    });
  },
};

async function handleCreateRule(interaction) {
  await interaction.reply({
    content: '📝 Digite o nome da nova regra:',
    flags: 64,
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (collected) => {
    const ruleName = collected.content.trim();
    if (!ruleName) {
      return interaction.followUp({ content: '⚠️ O nome da regra não pode ser vazio.', flags: 64 });
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

      await interaction.followUp({ content: `✅ Regra criada com sucesso: **${ruleName}**.`, flags: 64 });
    } catch (error) {
      console.error(error);
      await interaction.followUp({ content: '❌ Ocorreu um erro ao criar a regra.', flags: 64 });
    }
  });
}

async function handleViewRules(interaction) {
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();

    if (rules.size === 0) {
      return interaction.reply({
        content: '⚠️ Não há regras de AutoMod configuradas no servidor.',
        flags: 64,
      });
    }

    const ruleList = rules.map((rule) => {
      const keywords = rule.triggerMetadata.keywordFilter.join(', ') || 'Nenhuma';
      return `🔹 **${rule.name}** (ID: \`${rule.id}\`) - Palavras: ${keywords}`;
    });

    const chunks = chunkMessage(ruleList.join('\n'), 2000);
    for (const chunk of chunks) {
      await interaction.followUp({ content: chunk, flags: 64 });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ Ocorreu um erro ao listar as regras.',
      flags: 64,
    });
  }
}

function chunkMessage(message, maxLength) {
  const chunks = [];
  while (message.length > maxLength) {
    let chunk = message.slice(0, maxLength);
    const lastLineBreak = chunk.lastIndexOf('\n');
    if (lastLineBreak > 0) {
      chunk = message.slice(0, lastLineBreak);
    }
    chunks.push(chunk);
    message = message.slice(chunk.length);
  }
  chunks.push(message);
  return chunks;
}