const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './data/antinuke.json';

// Garante que o arquivo existe e está corretamente formatado
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

module.exports = {
  name: 'antinuke',
  description: 'Ativa ou desativa o sistema Anti-Nuke no servidor.',
  usage: '${currentPrefix}antinuke [on/off]',
  permissions: 'Administrator',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Uso incorreto! Use `.antinuke on` para ativar ou `.antinuke off` para desativar.',
          iconURL: 'https://bit.ly/43PItSI'
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
      console.error('Erro ao ler o arquivo antinuke.json:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4C4C')
            .setTitle('Erro')
            .setDescription('Ocorreu um erro ao acessar o sistema Anti-Nuke. Tente novamente mais tarde.')
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    if (option === 'on') {
      settings[guildId] = { enabled: true };
    } else {
      delete settings[guildId];
    }

    // Tenta salvar as alterações no arquivo JSON
    try {
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));
    } catch (error) {
      console.error('Erro ao salvar o arquivo antinuke.json:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4C4C')
            .setTitle('Erro')
            .setDescription('Falha ao salvar as configurações do Anti-Nuke. Tente novamente.')
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const embed = new EmbedBuilder()
      .setColor(option === 'on' ? '#2ecc71' : '#FE3838')
      .setTitle(`Anti-Nuke ${option === 'on' ? 'Ativado' : 'Desativado'}`)
      .setDescription(`O sistema Anti-Nuke foi **${option === 'on' ? 'ativado' : 'desativado'}** neste servidor.`)
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
