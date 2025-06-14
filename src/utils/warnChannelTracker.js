const fs = require('fs');
const path = require('path');

const WARN_CHANNELS_PATH = path.join(__dirname, '..', 'data', 'warnChannels.json');

function saveWarnChannel(guildId, channelId) {
  let data = {};
  if (fs.existsSync(WARN_CHANNELS_PATH)) {
    data = JSON.parse(fs.readFileSync(WARN_CHANNELS_PATH, 'utf8'));
  }
  data[guildId] = channelId;
  fs.writeFileSync(WARN_CHANNELS_PATH, JSON.stringify(data, null, 2));
}

module.exports = { saveWarnChannel };
