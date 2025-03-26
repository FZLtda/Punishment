const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "servers",
  description: "Lista os servidores onde o bot está presente.",
  category: "utilidade",
  execute: async (client, message) => {
    try {
      // Verifica se está sendo executado em um servidor
      if (!message.guild) return message.channel.send("Esse comando só pode ser usado dentro de servidores.");

      // Garante que o cache de servidores existe
      if (!client.guilds || !client.guilds.cache.size) {
        return message.channel.send("O bot não está em nenhum servidor no momento.");
      }

      const guilds = client.guilds.cache.map(guild => `🔹 **${guild.name}** \`(${guild.id})\` - 👥 ${guild.memberCount} membros`);
      
      // Divide a lista caso ultrapasse o limite de caracteres do Discord (4096)
      const chunks = [];
      let currentChunk = "";
      for (const guildInfo of guilds) {
        if ((currentChunk + "\n" + guildInfo).length > 4000) {
          chunks.push(currentChunk);
          currentChunk = guildInfo;
        } else {
          currentChunk += "\n" + guildInfo;
        }
      }
      chunks.push(currentChunk);

      // Envia embeds em partes se necessário
      for (const chunk of chunks) {
        const embed = new EmbedBuilder()
          .setTitle("📋 Servidores onde estou:")
          .setDescription(chunk)
          .setColor("Blue")
          .setFooter({ text: `Total: ${client.guilds.cache.size} servidores` });

        await message.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error("[ERRO] Falha ao executar o comando 'servers':", error);
      return message.channel.send("Ocorreu um erro ao tentar listar os servidores.");
    }
  }
};
