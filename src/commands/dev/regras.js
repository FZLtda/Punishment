'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const { emojis, colors, channels, bot } = require('@config');

/**
 * @typedef {import('discord.js').Message} Message
 * @typedef {import('discord.js').Client} Client
 */

module.exports = {
  name: 'regras',
  description: 'Envia as regras do servidor com botão para aceitar',
  usage: '.regras',
  permissions: ['SendMessages', 'ViewChannel'],
  deleteMessage: true,

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const rulesChannel = await message.client.channels
      .fetch(channels.rules)
      .catch(() => null);

    if (!rulesChannel || rulesChannel.type !== ChannelType.GuildText) {
      return message.channel.send(
        `${emojis.attentionEmoji} Canal de regras não encontrado ou não é um canal de texto.`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle('Regras do Servidor')
      .setColor(colors.green)
      .setDescription([
        `**1. Respeito**   
        <:seta2:1325132415542231140> Trate todos com educação. Ofensas, discriminação e discussões desnecessárias não serão toleradas.`,

        ``,

        `**2. Conteúdo Apropriado**   
        <:seta2:1325132415542231140> Não publique spam, flood, links maliciosos ou conteúdos inadequados.`,

        ``,

        `**3. Suporte**   
        <:seta2:1325132415542231140> Use o canal de suporte apenas para dúvidas ou problemas relacionados ao **Punishment**.`,

        ``,

        `**4. Divulgação**   
        <:seta2:1325132415542231140> É proibido divulgar qualquer conteúdo sem autorização de um administrador.`,

        ``,

        `**5. Segurança**   
        <:seta2:1325132415542231140> Nunca compartilhe dados pessoais. A equipe nunca pedirá suas informações sensíveis.`,

        ``,

        `**6. Punições**   
        <:seta2:1325132415542231140> O descumprimento das regras resultará em punições. A moderação tem a palavra final.`,

        ``,

        `> **__Clique no botão abaixo para aceitar nossas regras.__**`,
      ].join('\n'))
      .setFooter({
        text: 'FuncZone',
        iconURL: message.guild.iconURL(),
      });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Aceitar Regras')
        .setStyle(ButtonStyle.Success)
        .setEmoji(emojis.checkEmoji)
    );

    try {
      await rulesChannel.send({
        embeds: [embed],
        components: [actionRow],
      });

      if (message.channel.id !== rulesChannel.id) {
        await message.channel.send(
          `${emojis.successEmoji} Mensagem de regras enviada.`
        );
      }
    } catch (error) {
      console.error('[REGRAS] Erro ao enviar mensagem:', error);

      await message.channel.send(
        `${emojis.attentionEmoji} Não foi possível enviar a mensagem no canal de regras.`
      );
    }
  },
};
