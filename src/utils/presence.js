presence: {
  activity: {
    state: `${DEFAULT_PREFIXES[0]}help  •  ${DEFAULT_BOT_NAME}`,
    name: `${DEFAULT_PREFIXES[0]}help  •  ${DEFAULT_BOT_NAME}`,
    emoji: {
      name: "🧪"
    },
    type: ActivityTypes.CUSTOM_STATUS,
  },
  status: PresenceStatuses.ONLINE,
}

module.exports = { setPresence };


