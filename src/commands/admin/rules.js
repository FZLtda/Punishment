const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'rules',
  description: 'Envia o painel com as regras do servidor.',
  usage: '${currentPrefix}rules',
  userPermissions: ['Administrator'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    if (message.author.id !== '1006909671908585586') return;

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle('Regras do Servidor')
      .setDescription(
        `**1. Respeito** <:seta2:1325132415542231140> Trate todos com educação. Ofensas, discriminação e discussões desnecessárias não serão toleradas.\n\n` +
        `**2. Conteúdo Apropriado** <:seta2:1325132415542231140> Não publique spam, flood, links maliciosos ou conteúdos inadequados.\n\n` +
        `**3. Suporte** <:seta2:1325132415542231140> Use o canal de suporte apenas para dúvidas ou problemas relacionados ao **Punishment**.\n\n` +
        `**4. Divulgação** <:seta2:1325132415542231140> É proibido divulgar qualquer conteúdo sem autorização da equipe.\n\n` +
        `**5. Segurança** <:seta2:1325132415542231140> Nunca compartilhe dados pessoais. A equipe nunca pedirá suas informações sensíveis.\n\n` +
        `**6. Punições** <:seta2:1325132415542231140> O descumprimento das regras resultará em punições. A moderação tem a palavra final.\n\n` +
        `> **__Clique no botão abaixo para aceitar as regras.__**`
      )
      .setFooter({
        text: message.guild.name,
        iconURL: message.guild.iconURL({ dynamic: true }),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_user')
        .setLabel('Aceitar Regras')
        .setStyle(ButtonStyle.Success)
        .setEmoji(emojis.check)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
