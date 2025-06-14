class WinnerSelector {
    static select(participants, count) {
        if (participants.length === 0) return [];
        let winners = [];
        for (let i = 0; i < count && participants.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            winners.push(`<@${participants[randomIndex]}>`);
            participants.splice(randomIndex, 1);
        }
        return winners;
    }
}

module.exports = WinnerSelector;
