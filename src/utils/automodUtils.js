async function manageWordBlockRule(guild, status) {
  const rules = await guild.autoModerationRules.fetch();
  const wordRule = rules.find((rule) => rule.name === 'Bloqueio de Palavras');
  
  if (status && !wordRule) {
    await guild.autoModerationRules.create({
      name: 'Bloqueio de Palavras',
      creatorId: guild.ownerId,
      enabled: true,
      eventType: 1,
      triggerType: 1,
      triggerMetadata: { keywordFilter: ['palavra1', 'palavra2'] },
      actions: [{ type: 1 }],
    });
  } else if (!status && wordRule) {
    await wordRule.delete();
  }
}
  
module.exports = { manageWordBlockRule };