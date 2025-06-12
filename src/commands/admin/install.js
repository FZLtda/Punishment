const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'install',
  description: 'Instala um pacote NPM diretamente pelo Discord.',
  ownerOnly: true,
  async execute(message, args) {
    const pacote = args[0];
    if (!pacote) return message.reply('Especifique o pacote: `.install <pacote>`');

    const msg = await message.reply(`Instalando \`${pacote}\`...`);

    exec(`npm install ${pacote}`, (err, stdout, stderr) => {
      const embed = new EmbedBuilder()
        .setColor(err ? 0xff0000 : 0x00ff00)
        .setTitle(err ? 'Erro ao instalar' : 'Pacote instalado')
        .setDescription(`\`\`\`bash\n${stderr || stdout.slice(0, 1900)}\n\`\`\``);
      msg.edit({ content: '', embeds: [embed] });
    });
  },
};
