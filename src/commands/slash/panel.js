'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'painelmod',
  description: 'Abre um painel de moderação com ações rápidas.',
  usage: '${currentPrefix}painelmod <@usuário>',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers', 'BanMembers', 'KickMembers', 'ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro)
      return sendEmbed('yellow', message, 'Você precisa mencionar um membro válido para moderar.');

    if (membro.id === message.author.id)
      return sendEmbed('yellow', message, 'Você não pode usar esse painel em si mesmo.');

    if (membro.id === message.client.user.id)
      return sendEmbed('yellow', message, 'Não posso moderar a mim mesmo.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`painelmod:ban:${membro.id}`).setLabel('Banir').setStyle(ButtonStyle.Danger).setEmoji('🔨'),
      new ButtonBuilder().setCustomId(`painelmod:kick:${membro.id}`).setLabel('Expulsar').setStyle(ButtonStyle.Secondary).setEmoji('👢'),
      new ButtonBuilder().setCustomId(`painelmod:mute:${membro.id}`).setLabel('Mutar').setStyle(ButtonStyle.Primary).setEmoji('🔇'),
      new ButtonBuilder().setCustomId(`painelmod:unmute:${membro.id}`).setLabel('Desmutar').setStyle(ButtonStyle.Success).setEmoji('🔈'),
      new ButtonBuilder().setCustomId(`painelmod:block:${membro.id}`).setLabel('Bloquear Canal').setStyle(ButtonStyle.Secondary).setEmoji('🚫'),
    );

    const painel = new EmbedBuilder()
      .setTitle('Painel de Moderação')
      .setColor(colors.yellow)
      .setDescription(`Escolha uma ação para moderar ${membro} (\`${membro.id}\`).`)
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const msg = await message.channel.send({
      content: `${message.author}`,
      embeds: [painel],
      components: [row]
    });

    // Coletor de botões (opcional mover para listener separado)
    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60_000 });

    collector.on('collect', async interaction => {
      const [_, acao, alvoId] = interaction.customId.split(':');
      const comando = message.client.commands.get(acao);
      if (!comando) return interaction.reply({ content: 'Comando inválido.', ephemeral: true });

      // Redireciona para o comando correto passando o alvo
      const fakeMessage = { ...message, author: message.author, content: `${message.prefix}${acao} <@${alvoId}>`, args: [alvoId] };
      comando.execute(fakeMessage, [alvoId]);
      await interaction.deferUpdate();
    });

    collector.on('end', () => {
      if (!msg.deleted) {
        msg.edit({ components: [] }).catch(() => null);
      }
    });
  }
};
