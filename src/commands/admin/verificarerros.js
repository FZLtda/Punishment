const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');
const { yellow, red, green } = require('../../config/colors.json');
const { icon_attention, icon_success } = require('../../config/emoji.json');

module.exports = {
  name: 'verificarerros',
  description: 'Verifica e corrige erros em arquivos do bot usando ESLint.',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message) {
    const loadingEmbed = new EmbedBuilder()
      .setColor(yellow)
      .setTitle(`${icon_attention} Verificando e corrigindo arquivos...`)
      .setDescription('Por favor, aguarde enquanto os arquivos são analisados e corrigidos.')
      .setTimestamp();

    await message.reply({ embeds: [loadingEmbed] });

    const pasta = path.join(__dirname, '../../');
    const arquivos = [];

    const listarArquivos = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!['node_modules', '.git'].includes(file)) listarArquivos(fullPath);
        } else if (file.endsWith('.js')) {
          arquivos.push(fullPath);
        }
      }
    };

    listarArquivos(pasta);

    const erros = [];

    for (const file of arquivos) {
      try {
        new Function(fs.readFileSync(file, 'utf8'));
      } catch (e) {
        erros.push(`**${path.relative(pasta, file)}**\n\`\`\`js\n${e.message}\n\`\`\``);
      }
    }

    const comandoEslint = `npx eslint . --ext .js --fix`;

    exec(comandoEslint, { cwd: pasta }, async (error, stdout, stderr) => {
      if (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor(red)
          .setTitle('❌ Erro ao executar ESLint')
          .setDescription(`\`\`\`bash\n${error.message}\n\`\`\``)
          .setFooter({ text: 'Certifique-se de que o ESLint está instalado corretamente.' });

        return message.channel.send({ embeds: [errorEmbed] });
      }

      if (erros.length === 0) {
        const successEmbed = new EmbedBuilder()
          .setColor(green)
          .setTitle(`${icon_success} Nenhum erro de sintaxe encontrado!`)
          .setDescription(`Todos os arquivos foram analisados e corrigidos automaticamente.`)
          .setFooter({ text: `Revisado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        return message.channel.send({ embeds: [successEmbed] });
      } else {
        const erroEmbed = new EmbedBuilder()
          .setColor(red)
          .setTitle('❌ Erros de sintaxe encontrados')
          .setDescription(erros.slice(0, 5).join('\n\n') + (erros.length > 5 ? `\n\n...e mais ${erros.length - 5} arquivos com erro.` : ''))
          .setFooter({ text: `Corrija os erros antes de usar o comando novamente.` })
          .setTimestamp();

        return message.channel.send({ embeds: [erroEmbed] });
      }
    });
  }
};
