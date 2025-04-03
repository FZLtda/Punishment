const { EmbedBuilder } = require('discord.js');

function generateEmbed(commands, page, commandsPerPage, totalPages, message) {
  const start = (page - 1) * commandsPerPage;
  const end = start + commandsPerPage;
  const commandList = Array.from(commands.values()).slice(start, end);

  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('📚 Lista de Comandos')
    .setDescription(
      `Use \`${message.client.prefix}help [comando]\` para obter mais detalhes sobre um comando específico.`
    )
    .setFooter({
      text: `Página ${page} de ${totalPages} • Solicitado por ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  commandList.forEach((cmd) => {
    embed.addFields({
      name: cmd.name,
      value: `\`${cmd.description || 'Sem descrição'}\``,
      inline: false,
    });
  });

  return embed;
}

module.exports = { generateEmbed };