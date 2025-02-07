const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../data/verifyConfig.json');

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
}

const getVerifyConfig = (guildId) => {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config[guildId] || null;
};

const setVerifyConfig = (guildId, configData) => {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config[guildId] = configData;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
};

const deleteVerifyConfig = (guildId) => {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    delete config[guildId];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
};

module.exports = { getVerifyConfig, setVerifyConfig, deleteVerifyConfig };