const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre comandos.',
  usage: '.help [comando]',
  permissions: 'Nenhuma',
  execute: async (message, args) => {
    // Verifica se os comandos estão carregados no cliente
    if (!message.client.commands || message.client.commands.size === 0) {
      return message.reply({
        content: '⚠️ Os comandos não foram carregados corretamente. Verifique a configuração do bot.',
        ephemeral: true,
      });
    }

    // Se o usuário solicitou informações sobre um comando específico
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = message.client.commands.get(commandName);

      if (!command) {
        const embedErro = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({
            name: 'Comando não encontrado.',
            iconURL: 'http://bit.ly/4aIyY9j',
          })
          .setDescription(`O comando \`${commandName}\` não está registrado no sistema.`);

        return message.reply({ embeds: [embedErro] });
      }

      // Exibe informações detalhadas sobre o comando
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Informações do Comando: \`${command.name}\``)
        .setDescription(command.description || 'Nenhuma descrição disponível.')
        .addFields(
          { name: 'Uso', value: command.usage || 'Não especificado.', inline: true },
          { name: 'Permissões Necessárias', value: command.permissions || 'Nenhuma', inline: true }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

    // Página principal do comando `help`
    const allCommands = message.client.commands.map(
      (cmd) => `\`${cmd.name}\`: ${cmd.description || 'Sem descrição disponível.'}`
    );

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('📜 Lista de Comandos')
      .setDescription(allCommands.join('\n'))
      .addFields(
        {
          name: 'Ajuda Detalhada',
          value: 'Use `.help <comando>` para obter informações detalhadas sobre um comando específico.',
        },
        {
          name: 'Links Úteis',
          value: '[Servidor de Suporte](https://discord.gg/exemplo)',
        }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed] });
  },
};