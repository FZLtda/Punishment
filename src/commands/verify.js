const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const configPath = path.resolve(__dirname, '../../data/verifyConfig.json');

module.exports = {
  name: 'verify',
  description: 'Verifica o usuário e adiciona o cargo de Verificado.',
  usage: '.verify',
  permissions: 'SendMessages',
  async execute(message) {
    const guild = message.guild;
    const member = message.member;

    if (!fs.existsSync(configPath)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'O sistema de verificação não está configurado neste servidor!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[guild.id];

    if (!config || !config.verifiedRole) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'O sistema de verificação não foi configurado ainda. Peça para um administrador usar `.verify-setup`.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }

    const verifiedRole = guild.roles.cache.get(config.verifiedRole);
    const unverifiedRole = config.unverifiedRole ? guild.roles.cache.get(config.unverifiedRole) : null;

    if (!verifiedRole) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'O cargo de verificado não foi encontrado. Peça para um administrador configurar novamente.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }

    if (member.roles.cache.has(verifiedRole.id)) {
      const embedJaVerificado = new EmbedBuilder()
        .setColor('#FFCC00')
        .setAuthor({
          name: 'Você já está verificado!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedJaVerificado] });
    }

    try {
      await member.roles.add(verifiedRole);
      if (unverifiedRole) {
        await member.roles.remove(unverifiedRole);
      }

      const welcomeMessage = config.welcomeMessage.replace('{user}', message.author.username);
      const embedSucesso = new EmbedBuilder()
        .setColor('#2ECC71')
        .setAuthor({
          name: welcomeMessage,
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedSucesso] });

    } catch (error) {
      console.error('[ERROR] Erro ao verificar usuário:', error);
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Ocorreu um erro ao tentar verificar você.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });
      return message.reply({ embeds: [embedErro] });
    }
  },
};