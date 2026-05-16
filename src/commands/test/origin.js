"use strict";

const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const { EmbedBuilder } = require("discord.js");
const { bot, colors } = require("@config");
const { sendWarning } = require("@embeds");

module.exports = {
  name: "origin",
  aliases: ["update", "pull"],
  description: "Atualiza o código do bot puxando diretamente do repositório GitHub.",
  usage: "${currentPrefix}origin [branch] [link_do_repositório]",
  category: "Desenvolvedor",
  deleteMessage: false,

  async execute(message, args) {
    if (messag.author.id !== bot.ownerId) return;

    const branch = args[0] || "main";
    if (!/^[a-zA-Z0-9_-]+$/.test(branch)) {
      return sendWarning(message, "Branch inválido. Use apenas letras, números, hifens e underlines.");
    }

    const repoLink = args[1];
    const statusMessage = await message.reply("**Iniciando processo de atualização do repositório...**");

    try {
      const gitCommand = repoLink
        ? `git pull ${repoLink} ${branch}`
        : `git pull origin ${branch}`;

      await statusMessage.edit(`**Puxando atualizações (Branch: \`${branch}\`)...**`);
      const { stdout: gitOut } = await execAsync(gitCommand);

      if (gitOut.includes("Already up to date.") || gitOut.includes("Already up-to-date.")) {
        return statusMessage.edit("**O bot já está atualizado com o repositório.** Nenhuma alteração foi feita.");
      }

      await statusMessage.edit("**Código atualizado! Instalando possíveis novas dependências via NPM...**");
      const { stdout: npmOut } = await execAsync("npm install");

      const formatOutput = (text) => (text.length > 800 ? text.substring(0, 800) + "\n...[Output Truncado]" : text);

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle("Deploy Concluído com Sucesso!")
        .addFields(
          { name: "Terminal: Git", value: `\`\`\`bash\n${formatOutput(gitOut) || "Concluído sem saída no terminal."}\n\`\`\`` },
          { name: "Terminal: NPM", value: `\`\`\`bash\n${formatOutput(npmOut) || "Nenhuma nova dependência instalada."}\n\`\`\`` }
        )
        .setFooter({ text: "Aplicando mudanças..." })
        .setTimestamp();

      await statusMessage.edit({ content: null, embeds: [embed] });

      setTimeout(() => {
        process.exit(0);
      }, 3000);
    } catch (error) {
      console.error("[origin command] Erro crítico durante a atualização:", error);

      const errorMessage = error.message.length > 1000 ? error.message.substring(0, 1000) + "\n...[Truncado]" : error.message;

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle("Falha na Atualização (Merge Conflict / Erro de Sintaxe)")
        .setDescription(`\`\`\`bash\n${errorMessage}\n\`\`\``)
        .setFooter({ text: "Verifique possíveis conflitos de merge ou problemas de conexão no host." });

      await statusMessage.edit({ content: null, embeds: [errorEmbed] });
    }
  }
};
