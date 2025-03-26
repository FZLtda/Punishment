const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: "servers",
  description: "Lista os servidores onde o bot está presente.",
  execute: async (client, message, args) => {
    try {
      if (!client.guilds.cache) {
        return message.reply("Não foi possível obter os servidores.");
      }

      const servers = client.guilds.cache.map(guild => `${guild.name} - [ID: ${guild.id}]`).join("\n");
      
      if (!servers) {
        return message.reply("O bot não está em nenhum servidor ou não foi possível listar.");
      }

      message.reply(`O bot está nos seguintes servidores:\n\`\`\`\n${servers}\n\`\`\``);
    } catch (error) {
      console.error("[ERRO] Falha ao executar o comando 'servers':", error);
      message.reply("Ocorreu um erro ao tentar listar os servidores.");
    }
  }
};
