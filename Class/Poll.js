const { Client } = require("./Client.js");

module.exports = class Poll {
    /**
     * Create a poll instance. Will raise errors if properties are invalids.
     * @param {Client} client The bot client
     * @param {String} channel The channel's id where to post poll
     * @param {String} broadcaster_id User access token of the channel where post poll
     * @param {String} title Poll's title (up to 60 characters)
     * @param {Object} options Poll's options
     * @param {{title: String}[]} options.choices Choices list (at least 2, up to 5; default: "Yes" and "No")
     * @param {Number} options.duration Poll's maximum duration in seconds (between 15 and 1800; default: 300)
     * @param {Object} options.channel_points Define if channel points votes are enabled (default: false) and the amount per vote
     * @param {Boolean} options.channel_points.enabled Can viewers put additional votes with channel points ? (default: false)
     * @param {Number} options.channel_points.amount Amount of channel points per vote (between 1 and 1_000_000; required only if enabled is set to true)
     * @param {Boolean} run Is the poll get created on twitch channel directly ?
     */
    constructor(client, channel, title, options = {}) {
        let default_options = {
            choices: [{ "title": "Yes" }, { "title": "No" }],
            duration: 300,
            channel_points: {
                enabled: false,
                amount: 1
            },
            run: true
        };
        let opt = {...default_options, ...options}
        this.client = client, this.oauth = this.client.oauthCodes[channel], this.title = title, this.choices = opt.choices, this.duration = opt.duration, this.channel_points = opt.channel_points;
        fetch("https://api.twitch.tv/helix/users", {
            method: "GET",
            headers: {
                "Authorization": this.oauth,
                "Client-Id": this.client.id
            }
        }).then(response => {
            if (response.status === 400) {
                throw Error("The oauth token isn't a user access token.")
            }
            if (response.status !== 200) {
                throw Error(response.statusText)
            }
            response.json().then(d => {
                let data = d.data[0]
                this.broadcaster_id = data.id
                if (opt.run) {
                    this.createPoll();
                };
            });
        });
    };

    createPoll() {
        if (isNaN(this.broadcaster_id) || (typeof this.broadcaster_id !== "string")) {
            throw new TypeError("Broadcaster ID is not a string of number.");
        };
        if (this.title.length < 1 || this.title.length > 60) {
            throw new RangeError("Poll's title is empty or too long.");
        };
        if (this.choices.length < 2 || this.choices.length > 5) {
            throw new RangeError("Poll's choices list is too short or too long.");
        };
        this.choices.forEach(element => {
            if (!element.title) {
                throw new Error(JSON.stringify(element) + " hasn't title property.");
            };
            if (Object.getOwnPropertyNames(element).length !== 1) {
                throw new Error(JSON.stringify(element) + " has more properties than just title.");
            };
        });
        if (typeof this.channel_points.enabled !== "boolean") {
            throw new TypeError("Don't know if I must enable channel points votes.");
        };
        if (typeof this.channel_points.amount !== "number") {
            throw new TypeError("Channel points amount per vote is not a number.");
        };
        if (this.channel_points.amount < 1 || this.channel_points.amount > 1_000_000) {
            throw new RangeError("Channel points amount per vote is too low or too high.");
        };
        if (typeof this.duration !== "number") {
            throw new TypeError("Duration isn't a number.");
        };
        if (this.duration < 15 || this.duration > 1_800) {
            throw new RangeError("Duration is too short or too long.");
        };
        let body = {
            "broadcaster_id": this.broadcaster_id,
            "title": this.title,
            "choices": this.choices,
            "channel_points_voting_enabled": this.channel_points.enabled,
            "channel_points_per_vote": this.channel_points.amount,
            "duration": this.duration
        };
        fetch("https://api.twitch.tv/helix/polls", {
            method: "POST",
            headers: {
                "Authorization": this.oauth,
                "Client-Id": this.client.id,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(response => {
            response.json().then(d => {
                let data = d.data[0]
                console.log(JSON.stringify(data, undefined, 4))
                this.id = data.id
            });
        }).catch(console.error);
    };

    endPoll(status = "TERMINATED") {
        let body = {
            "broadcaster_id": this.broadcaster_id,
            "id": this.id,
            "status": status
        };
        fetch("https://api.twitch.tv/helix/polls", {
            method: "PATCH",
            headers: {
                "Authorization": this.client.Oauth,
                "Client-Id": this.client.id,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(response => {
            response.json().then(data => console.log(JSON.stringify(data, undefined, 4)));
        }).catch(console.error);
    };
};