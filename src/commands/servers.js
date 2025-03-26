const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "servers",
  description: "Lista todos os servidores onde o bot está.",
  category: "utilidade",
  execute: async (client, message, args) => {
    try {
      if (!message.guild) return;

      const guilds = client.guilds.cache.map(guild => `🔹 **${guild.name}** (ID: \`${guild.id}\`)`);
      if (guilds.length === 0) {
        return message.channel.send("O bot não está em nenhum servidor.");
      }

      const embed = new EmbedBuilder()
        .setTitle("📋 Servidores onde estou:")
        .setDescription(guilds.join("\n"))
        .setColor("Blue")
        .setFooter({ text: `Total: ${guilds.length} servidores` });

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error("[ERRO] Falha ao executar o comando 'servers':", error);
      message.channel.send("Ocorreu um erro ao tentar listar os servidores.");
    }
  }
};
