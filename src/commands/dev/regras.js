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
  description: 'Envia as regras com o layout idêntico ao Visual Refresh V2',
  usage: '.regras',
  permissions: ['SendMessages', 'ViewChannel'],
  deleteMessage: true,

  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const rulesChannel = await message.client.channels
      .fetch(channels.rules)
      .catch(() => null);

    if (!rulesChannel || rulesChannel.type !== ChannelType.GuildText) {
      return message.channel.send('❌ Canal de regras inválido.');
    }

    const embed = new EmbedBuilder()
      // Cor #2b2d31 faz o embed "sumir" e se misturar ao fundo do Discord Dark
      .setColor('#2b2d31') 
      .setThumbnail(message.guild.iconURL()) // O logo FZ no canto superior
      .setDescription([
        '# **FuncZone**', // Header Markdown para o título grande
        'Regras do servidor',
        '',
        '**Seja consciente nas interações**',
        'Não compartilhe conteúdo nocivo, como vírus, pornografia ou material violento. Qualquer tipo de conteúdo prejudicial resultará em banimento imediato e permanente.',
        '',
        '**Respeite a todos**',
        'Trate moderadores e membros com respeito. Evite discussões ofensivas, provocações, desinformação ou mensagens que atrapalhem o convívio. Nosso servidor é um espaço inclusivo — mantenha o respeito sempre.',
        '',
        '**Sem divulgação ou spam**',
        'Não é permitido divulgar outros servidores, links, redes sociais, nem enviar mensagens repetitivas, emojis ou imagens em excesso (spam).',
        '',
        '**Mantenha tudo limpo e apropriado**',
        'Evite nomes, avatares, status ou perfis com conteúdo ofensivo, político, apelativo ou confuso. Use emojis e símbolos com moderação.',
        '',
        '**Importante**',
        'As punições não podem ser apeladas, portanto siga as regras com atenção.',
        '',
        '___________________________________________', // Linha sutil separadora
        '*Essas regras não cobrem todos os casos possíveis. A moderação pode agir em qualquer comportamento inadequado. Use o bom senso e mantenha o respeito.*'
      ].join('\n'));

    // Botão estilo "Secondary" que no V2 mobile ocupa a largura total e fica flat
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Reaja aqui para acessar o servidor.')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❯') // Usando o caractere de seta fina igual ao da imagem
    );

    try {
      await rulesChannel.send({
        embeds: [embed],
        components: [actionRow],
      });

      if (message.channel.id !== rulesChannel.id) {
        await message.channel.send('✅ Mensagem de regras enviada com sucesso.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
