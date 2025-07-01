const { EmbedBuilder } = require('discord.js');
const { getPrefix } = require('@utils/prefixManager');
const { paginate } = require('@utils/paginator');

// Categorias organizadas (sem ícones por enquanto)
const categories = {
  core: 'Comandos do Sistema',
  mod: 'Moderação',
  util: 'Utilidades',
  info: 'Informação',
  fun: 'Diversão'
};

function createHelpPage(categoryName, commandList = []) {
  const embed = new EmbedBuilder()
    .setTitle(`📖 ${categoryName}`)
    .setDescription('Use `/help <comando>` ou `.help <comando>` para mais detalhes.')
    .setColor(0x5865f2);

  commandList.forEach(cmd => {
    const nome = cmd.data?.name || cmd.name;
    const desc = cmd.data?.description || cmd.description || 'Sem descrição.';
    embed.addFields({ name: `/${nome}`, value: desc });
  });

  return embed;
}

function createCommandPage(command, prefix) {
  const nome = command.data?.name || command.name;
  const desc = command.data?.description || command.description || 'Sem descrição.';
  const usage = command.usage || `/${nome}`;

  const embed = new EmbedBuilder()
    .setTitle(`🔍 Detalhes do comando: ${nome}`)
    .setDescription(desc)
    .addFields({ name: 'Uso', value: `\`${usage.replace('${currentPrefix}', prefix)}\`` })
    .setColor(0x5865f2);

  if (command.examples) {
    embed.addFields({
      name: 'Exemplos',
      value: command.examples.map(e => `\`${e}\``).join('\n')
    });
  }

  return embed;
}

module.exports = {
  name: 'help',
  description: 'Lista todos os comandos disponíveis ou exibe detalhes de um específico.',
  usage: '${currentPrefix}help [comando]',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const allCommands = message.client.commands;
    const prefix = await getPrefix(message.guild?.id) || DEFAULT_PREFIX;

    if (args[0]) {
      const query = args[0].toLowerCase();
      const command = allCommands.get(query) ||
        [...allCommands.values()].find(cmd => cmd.aliases?.includes(query));

      if (!command) {
        return message.reply({
          content: `Comando \`${query}\` não encontrado.`,
          allowedMentions: { repliedUser: false }
        });
      }

      const cmdPage = createCommandPage(command, prefix);
      return message.channel.send({ embeds: [cmdPage] });
    }

    // Agrupar comandos por categoria
    const grouped = {};
    for (const cmd of allCommands.values()) {
      const cat = cmd.category || 'util';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }

    const pages = Object.keys(categories).map(cat =>
      createHelpPage(categories[cat], grouped[cat] || [])
    );

    return paginate(message, pages, { timeout: 60_000 });
  }
};
