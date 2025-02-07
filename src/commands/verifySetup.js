const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const configPath = path.resolve(__dirname, '../../data/verifyConfig.json');

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({}), { flag: 'wx' });
}

module.exports = {
  name: 'verify-setup',
  description: 'Configura o sistema de verificação no servidor.',
  usage: 'verify-setup <cargo-verificado> [cargo-não-verificado] [mensagem]',
  permissions: 'Administrador',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa ser administrador para configurar o sistema!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }

    const verifiedRole = message.mentions.roles.first();
    const unverifiedRole = message.mentions.roles.size > 1 ? message.mentions.roles.at(1) : null;
    const customMessage = args.slice(unverifiedRole ? 2 : 1).join(' ') || 'Parabéns {user}! Agora você está verificado!';

    if (!verifiedRole) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa mencionar o cargo de verificado!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config[message.guild.id] = {
      verifiedRole: verifiedRole.id,
      unverifiedRole: unverifiedRole ? unverifiedRole.id : null,
      welcomeMessage: customMessage,
      buttonLabel: 'Verificar Agora',
      buttonColor: 'Success',
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    const embedSucesso = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('<:1000042885:1336044571125354496> Sistema de Verificação')
      .setDescription(`**Cargo de Verificado:** <@&${verifiedRole.id}>\n` +
                      `${unverifiedRole ? `**Cargo de Não Verificado:** <@&${unverifiedRole.id}>\n` : ''}` +
                      `**Mensagem Personalizada:** ${customMessage}`)
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

    return message.reply({ embeds: [embedSucesso] });
  },
};