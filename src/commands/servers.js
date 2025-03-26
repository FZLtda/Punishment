const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "servers",
  description: "Lista os servidores onde o bot está presente.",
  category: "utilidade",
  execute: async (client, message) => {
    try {
      // Garante que message e channel existem
      if (!message || !message.channel) return;

      // Verifica se há servidores no cache
      if (!client.guilds.cache.size) {
        return message.channel.send("❌ O bot não está em nenhum servidor.");
      }

      // Obtém a lista de servidores
      const guilds = client.guilds.cache.map(guild => `🔹 **${guild.name}** \`(${guild.id})\` - 👥 ${guild.memberCount} membros`);

      // Divide a mensagem em partes menores para evitar limite do Discord
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

      // Envia os embeds com segurança
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
      if (message.channel) {
        message.channel.send("❌ Ocorreu um erro ao tentar listar os servidores.");
      }
    }
  }
};
