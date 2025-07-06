'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { colors, emojis } = require('@config');
const { getPrefix } = require('@utils/prefixManager');
const Logger = require('@logger');
const checkTerms = require('@middlewares/checkTerms');

module.exports = {
  name: 'messageCreate',

  /**
   * Evento que escuta mensagens e executa comandos prefixados.
   * @param {import('discord.js').Message} message - A mensagem recebida.
   * @returns {Promise<void>}
   */
  async execute(message) {
    try {
      // Ignora mensagens de bots e DMs
      if (!message.guild || message.author.bot) return;

      // Obtém o prefixo do servidor
      const prefix = message.client.getPrefix
        ? await message.client.getPrefix(message.guild.id)
        : await getPrefix(message.guild.id);

      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = message.client.commands.get(commandName);
      if (!command) return;

      // Check de Termos de Uso
      const accepted = await checkTerms({
        user: message.author,
        client: message.client,
        reply: opts => message.channel.send({ ...opts, ephemeral: true })
      });

      if (!accepted) {
        Logger.info(`[TERMS] Usuário ${message.author.tag} bloqueado por não aceitar os termos.`);
        return;
      }

      const member = await message.guild.members.fetch(message.author.id);
      const botMember = message.guild.members.me;

      // Validação de permissões do usuário
      if (command.userPermissions) {
        const missing = command.userPermissions.filter(p => !member.permissions.has(p));
        if (missing.length > 0) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.red)
                .setAuthor({
                  name: 'Permissão negada',
                  iconURL: emojis.attention || null
                })
                .setDescription(`Você precisa das permissões: \`${missing.join(', ')}\``)
            ],
            allowedMentions: { repliedUser: false }
          });
        }
      }

      // Validação de permissões do bot
      if (command.botPermissions) {
        const missing = command.botPermissions.filter(p => !botMember.permissions.has(p));
        if (missing.length > 0) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.yellow)
                .setAuthor({
                  name: 'Permissão insuficiente',
                  iconURL: emojis.attention || null
                })
                .setDescription(`Eu preciso das permissões: \`${missing.join(', ')}\``)
            ],
            allowedMentions: { repliedUser: false }
          });
        }
      }

      // Deleta a mensagem do usuário (caso configurado no comando)
      if (command.deleteMessage) {
        try {
          await message.delete();
        } catch (err) {
          Logger.warn(`[DELETE] Não foi possível apagar a mensagem de ${message.author.tag}: ${err.message}`);
        }
      }

      // Executa o comando
      await command.execute(message, args);
    } catch (error) {
      Logger.error(`[EXEC] Erro ao executar comando: ${error.stack || error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle('Erro inesperado')
        .setDescription('Houve um problema ao executar este comando. A equipe foi notificada.')
        .setFooter({
          text: 'Punishment • messageCreate',
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      if (message.channel && message.channel.send) {
        await message.channel.send({
          embeds: [errorEmbed],
          allowedMentions: { repliedUser: false }
        });
      }
    }
  }
};
