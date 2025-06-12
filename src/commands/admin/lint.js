const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'lint',
  description: 'Executa o ESLint com --fix no projeto.',
  ownerOnly: true,
  async execute(message) {
    const msg = await message.reply('🔍 Executando ESLint...');

    exec('npx eslint . --ext .js --fix', (err, stdout, stderr) => {
      const output = stdout || stderr || 'Nenhum resultado.';
      const embed = new EmbedBuilder()
        .setColor(err ? 0xff0000 : 0x00ff00)
        .setTitle(err ? '⚠️ Erros encontrados' : '✅ ESLint executado com sucesso')
        .setDescription(`\`\`\`bash\n${output.slice(0, 1900)}\n\`\`\``);

      msg.edit({ content: '', embeds: [embed] });
    });
  },
};
