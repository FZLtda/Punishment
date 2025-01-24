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
          ephemeral: true,
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
          await interaction.reply({ content: '❌ Botão inválido.', ephemeral: true });
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
    ephemeral: true,
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (collected) => {
    const ruleName = collected.content.trim();
    if (!ruleName) {
      return interaction.followUp('⚠️ O nome da regra não pode ser vazio.');
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

      await interaction.followUp(`✅ Regra criada com sucesso: **${ruleName}**.`);
    } catch (error) {
      console.error(error);
      await interaction.followUp('❌ Ocorreu um erro ao criar a regra.');
    }
  });
}

async function handleAddWord(interaction) {
  await interaction.reply({
    content: '📝 Digite o ID da regra onde deseja adicionar palavras:',
    ephemeral: true,
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 2 });

  let step = 0;
  let ruleId;

  collector.on('collect', async (collected) => {
    if (step === 0) {
      ruleId = collected.content.trim();
      await interaction.followUp('📝 Agora, digite as palavras que deseja adicionar (separe por vírgulas):');
      step++;
    } else {
      const words = collected.content.split(',').map((word) => word.trim());
      try {
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        if (!rule) {
          return interaction.followUp('⚠️ Regra não encontrada.');
        }

        const existingWords = rule.triggerMetadata.keywordFilter || [];
        await rule.edit({
          triggerMetadata: {
            keywordFilter: [...existingWords, ...words],
          },
        });

        await interaction.followUp(`✅ Palavras adicionadas com sucesso à regra **${rule.name}**.`);
      } catch (error) {
        console.error(error);
        await interaction.followUp('❌ Ocorreu um erro ao adicionar palavras.');
      }
    }
  });
}

async function handleDeleteRule(interaction) {
  await interaction.reply({
    content: '🗑️ Digite o ID da regra que deseja excluir:',
    ephemeral: true,
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (collected) => {
    const ruleId = collected.content.trim();

    try {
      const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
      if (!rule) {
        return interaction.followUp('⚠️ Regra não encontrada.');
      }

      await rule.delete();
      await interaction.followUp(`✅ Regra **${rule.name}** excluída com sucesso.`);
    } catch (error) {
      console.error(error);
      await interaction.followUp('❌ Ocorreu um erro ao excluir a regra.');
    }
  });
}

async function handleRemoveWord(interaction) {
  await interaction.reply({
    content: '🗑️ Digite o ID da regra onde deseja remover palavras:',
    ephemeral: true,
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 2 });

  let step = 0;
  let ruleId;

  collector.on('collect', async (collected) => {
    if (step === 0) {
      ruleId = collected.content.trim();
      await interaction.followUp('📝 Agora, digite as palavras que deseja remover (separe por vírgulas):');
      step++;
    } else {
      const wordsToRemove = collected.content.split(',').map((word) => word.trim());
      try {
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        if (!rule) {
          return interaction.followUp('⚠️ Regra não encontrada.');
        }

        const updatedWords = rule.triggerMetadata.keywordFilter.filter(
          (word) => !wordsToRemove.includes(word)
        );
        await rule.edit({
          triggerMetadata: {
            keywordFilter: updatedWords,
          },
        });

        await interaction.followUp(`✅ Palavras removidas com sucesso da regra **${rule.name}**.`);
      } catch (error) {
        console.error(error);
        await interaction.followUp('❌ Ocorreu um erro ao remover palavras.');
      }
    }
  });
}

async function handleViewRules(interaction) {
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();

    if (rules.size === 0) {
      return interaction.reply({
        content: '⚠️ Não há regras de AutoMod configuradas no servidor.',
        ephemeral: true,
      });
    }

    const ruleList = rules
      .map((rule) => `🔹 **${rule.name}** (ID: \`${rule.id}\`) - Palavras: ${rule.triggerMetadata.keywordFilter.join(', ') || 'Nenhuma'}`)
      .join('\n');

    await interaction.reply({
      content: `📋 **Regras de AutoMod configuradas:**\n${ruleList}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply('❌ Ocorreu um erro ao listar as regras.');
  }
}