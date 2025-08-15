'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const { emojis, colors, channels, bot } = require('@config');

module.exports = {
  name: 'regras',
  description: 'Envia as regras do servidor com botão para aceitar',
  usage: '.regras',
  permissions: ['SendMessages', 'ViewChannel'],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.owner) return;
    
    // Tenta pegar o canal das regras no servidor
    const channel = await client.channels.fetch(channels.rules).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.channel.send(`${emojis.attentionEmoji} Canal de regras não encontrado ou não é um canal de texto.`);
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
        <:seta2:1325132415542231140> É proibido divulgar qualquer conteúdo sem autorização da equipe.`,
        ``,
        `**5. Segurança** 
        <:seta2:1325132415542231140> Nunca compartilhe dados pessoais. A equipe nunca pedirá suas informações sensíveis.`,
        ``,
        `**6. Punições** 
        <:seta2:1325132415542231140> O descumprimento das regras resultará em punições. A moderação tem a palavra final.`,
        ``,
        `> **__Clique no botão abaixo para aceitar as regras.__**`,
      ].join('\n'))
      .setFooter({ text: 'FuncZone', iconURL: message.guild.iconURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Aceitar Regras')
        .setStyle(ButtonStyle.Success)
        .setEmoji(emojis.checkEmoji)
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
      if (message.channel.id !== channel.id) {
        await message.channel.send(`${emojis.successEmoji} Mensagem de regras enviada.`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem de regras:', error);
      await message.channel.send(`${emojis.attentionEmoji} Não foi possível enviar a mensagem no canal de regras.`);
    }
  }
};
