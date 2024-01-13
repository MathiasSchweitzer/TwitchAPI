

class Poll {
    /**
     * Create a poll instance
     * @param {String} broadcaster_id User access token of the channel where post poll
     * @param {String} title Poll's title (up to 60 characters)
     * @param {{choiceTitle: String}[]} choices Choices list (at least 2, up to 5; default: "Yes" and "No")
     * @param {String} choiceTitle Choice's text (up to 25 characters)
     * @param {Number} duration Poll's maximum duration in seconds (between 15 and 1800; default: 300)
     * @param {Object} channel_points Define channel points options for the poll
     * @param {Boolean} channel_points.enabled Can viewers put additional votes with channel points ? (default: false)
     * @param {Number} channel_points.amount Amount of channel points per vote (between 1 and 1.000.000; required only if enabled is set to true)
     * @param {Boolean} run Is the poll get created on twitch channel directly ?
     */
    constructor(client, broadcaster_id, title, choices = [{ title: "Yes" }, { title: "No" }], duration = 300, channel_points = { enabled: false }, run = true) {
        this.broadcaster_id = broadcaster_id, this.title = title, this.choices = choices, this.duration = duration, this.channel_points = channel_points
        if (run) {
            this.createPoll()
        }
    }
mdrrr
    createPoll() {
        
        let req = new Request("https://api.twitch.tv/helix/polls", { method: "POST", headers: headers })
        
    }
    
    endPoll() {

    }
}