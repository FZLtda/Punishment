const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre comandos disponíveis ou detalhes de um comando específico.',
  usage: '.help [comando]',
  permissions: 'Nenhuma',
  execute: async (message, args, client) => {
    try {
      // Verifica se os comandos estão carregados
      if (!client.commands || client.commands.size === 0) {
        return message.reply({
          content: '⚠️ Nenhum comando foi carregado. Verifique a configuração do bot.',
          ephemeral: true,
        });
      }

      // Caso um comando específico seja solicitado
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) {
          // Caso o comando não seja encontrado
          const embedErro = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
              name: 'Comando não encontrado',
              iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
            })
            .setDescription(`O comando \`${commandName}\` não foi encontrado.`);

          return message.reply({ embeds: [embedErro] });
        }

        // Exibe as informações detalhadas do comando solicitado
        const embedDetalhes = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle(`📄 Detalhes do Comando: \`${command.name}\``)
          .setDescription(command.description || 'Nenhuma descrição disponível.')
          .addFields(
            { name: '🛠 Uso', value: command.usage || 'Não especificado.', inline: true },
            { name: '🔑 Permissões Necessárias', value: command.permissions || 'Nenhuma', inline: true }
          )
          .setFooter({
            text: 'Punishment',
            iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
          });

        return message.reply({ embeds: [embedDetalhes] });
      }

      // Página inicial do comando `help`
      const embedGeral = new EmbedBuilder()
        .setColor('#00AAFF')
        .setTitle('📋 Lista de Comandos')
        .setDescription('Veja abaixo os comandos disponíveis. Use `.help <comando>` para mais detalhes.')
        .addFields(
          { name: 'help', value: 'Mostra a lista completa de comandos ou detalhes de um comando específico.', inline: true },
          { name: 'ping', value: 'Mostra os detalhes da conexão do bot.', inline: true },
          { name: 'privacy', value: 'Exibe a política de privacidade.', inline: true },
          { name: 'shard', value: 'Informações do shard.', inline: true },
          { name: 'stats', value: 'Exibe as estatísticas do bot.', inline: true },
          { name: 'undo', value: 'Desfaz o último comando executado.', inline: true }
        )
        .addFields(
          { name: '\u200b', value: '❓ Use `.help <comando>` para mais informações sobre um comando.' },
          { name: '\u200b', value: '📨 Precisa de ajuda? [Servidor de Suporte](https://discord.gg/exemplo)' }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedGeral] });
    } catch (error) {
      console.error(`[ERROR] Erro ao executar o comando "help":`, error);

      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setTitle('❌ Erro Interno')
        .setDescription('Houve um problema ao processar o comando. Tente novamente mais tarde.')
        .setFooter({
          text: 'Punishment',
          iconURL: client.user ? client.user.displayAvatarURL() : 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }
  },
};