const Discord = require('discord.js');

function handleReactionAdd(reaction, user) {
  const channelId = '1018658580016152736'; // ID do canal
  const roleId = '1267270735232110644'; // ID do cargo
  const emojiId = '1219788320234803250'; // ID do emoji

  if (reaction.message.channel.id === channelId && reaction.emoji.id === emojiId) {
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(roleId);

    if (role && member && !member.roles.cache.has(roleId)) {
      member.roles.add(role);
      console.log(`Cargo ${role.name} adicionado para ${member.user.tag}`);
    }
  }
}

module.exports = {handleReactionAdd};
