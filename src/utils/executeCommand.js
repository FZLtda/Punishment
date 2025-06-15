const { exec } = require('child_process');

class CommandExecutor {
    static run(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) return reject(stderr || error.message);
                resolve(stdout);
            });
        });
    }
}

module.exports = CommandExecutor;
