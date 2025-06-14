const timeUnits = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

class TimeParser {
    static parse(time) {
        const match = time.match(/^(\d+)([smhd])$/);
        if (!match) return { durationMs: null, endTime: null };
        const durationMs = parseInt(match[1]) * timeUnits[match[2]];
        return { durationMs, endTime: Date.now() + durationMs };
    }
}

module.exports = TimeParser;
