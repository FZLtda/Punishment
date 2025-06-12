const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');
const { icon_attention, icon_success } = require('../../config/emoji.json');
const { yellow, green, red } = require('../../config/colors.json');

const OWNERS = ['1006909671908585586'];

module.exports = {
  name: 'instalar',
  description: 'Instala pacotes NPM diretamente pelo Discord.',
  usage: '.instalar <pacote> [outros pacotes]',
  deleteMessage: true,

  async execute(message, args) {
    if (!OWNERS.includes(message.author.id)) {
      return message.reply({ content: '❌ Você não tem permissão para usar este comando.', allowedMentions: { repliedUser: false } });
    }

    const pacotes = args.join(' ').trim();

    if (!pacotes) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({ name: 'Uso incorreto! Informe o(s) pacote(s) a ser(em) instalado(s).', iconURL: icon_attention })]
      });
    }

    const installEmbed = new EmbedBuilder()
      .setColor(yellow)
      .setTitle(`${icon_attention} Instalando pacotes...`)
      .setDescription(`Pacotes: \`${pacotes}\`\nPor favor, aguarde.`)
      .setTimestamp();

    await message.reply({ embeds: [installEmbed], allowedMentions: { repliedUser: false } });

    const comando = `npm install ${pacotes}`;

    exec(comando, async (error, stdout, stderr) => {
      if (error) {
        const erroEmbed = new EmbedBuilder()
          .setColor(red)
          .setTitle('❌ Erro ao instalar os pacotes')
          .setDescription(`\`\`\`bash\n${stderr || error.message}\n\`\`\``)
          .setTimestamp();

        return message.channel.send({ embeds: [erroEmbed] });
      }

      const sucessoEmbed = new EmbedBuilder()
        .setColor(green)
        .setTitle(`${icon_success} Pacotes instalados com sucesso!`)
        .setDescription(`\`\`\`bash\n${stdout || 'Instalação concluída.'}\n\`\`\``)
        .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [sucessoEmbed] });
    });
  }
};
