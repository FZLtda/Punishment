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
          await interaction.followUp({ content: '❌ Botão inválido.' });
      }
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] }).catch(() => null);
    });
  },
};

async function handleCreateRule(interaction) {
  await interaction.followUp({
    content: '📝 Digite o nome da nova regra:',
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

  collector.on('collect', async (collected) => {
    const ruleName = collected.content.trim();
    if (!ruleName) {
      return interaction.followUp({ content: '⚠️ O nome da regra não pode ser vazio.' });
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

      await interaction.followUp({ content: `✅ Regra criada com sucesso: **${ruleName}**.` });
    } catch (error) {
      console.error(error);
      await interaction.followUp({ content: '❌ Ocorreu um erro ao criar a regra.' });
    }
  });
}

async function handleAddWord(interaction) {
  await interaction.followUp({
    content: '📝 Digite o ID da regra onde deseja adicionar palavras:',
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
  await interaction.followUp({
    content: '🗑️ Digite o ID da regra que deseja excluir:',
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

      // Verifica se a regra é imutável
      if (rule.isSystem) {
        return interaction.followUp('⚠️ Esta regra é gerenciada pelo Discord e não pode ser excluída.');
      }

      await rule.delete();
      await interaction.followUp(`✅ Regra **${rule.name}** excluída com sucesso.`);
    } catch (error) {
      console.error(error);

      if (error.code === 200006) {
        return interaction.followUp(
          '⚠️ Não é possível excluir regras padrão, como o filtro de spam de menções, em servidores comunitários.'
        );
      }

      await interaction.followUp('❌ Ocorreu um erro ao tentar excluir a regra.');
    }
  });
}

async function handleViewRules(interaction) {
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();

    if (rules.size === 0) {
      return interaction.followUp({
        content: '⚠️ Não há regras de AutoMod configuradas no servidor.',
      });
    }

    const ruleList = rules.map((rule) => {
      const keywords = rule.triggerMetadata.keywordFilter.join(', ') || 'Nenhuma';
      return `🔹 **${rule.name}** (ID: \`${rule.id}\`) - Palavras: ${keywords}`;
    });

    const chunks = chunkMessage(ruleList.join('\n'), 2000);
    for (const chunk of chunks) {
      await interaction.followUp({ content: chunk });
    }
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: '❌ Ocorreu um erro ao listar as regras.',
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