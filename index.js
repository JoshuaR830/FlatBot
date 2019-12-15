const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

var messageChannel;

app.post("/check-pending", (req, res) => {
    console.log("POST");
    var hasPendingVersion = req.body.hasPendingVersion;
    console.log(hasPendingVersion);
    if (hasPendingVersion) {
        messageChannel.send("Wait a minute - there's a pending version");
    } else {
        messageChannel.send("All clear - no pending versions");
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.get("/check-pending", (req, res) => {
    var hasPendingVersion = true;

    if (hasPendingVersion) {
        messageChannel.send("Wait a minute - there's a pending version");
    } else {
        messageChannel.send("All clear - no pending versions");
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.get("/set-pending", (req, res) => {
    var successfullySet = true;
    if(successfullySet) {
        messageChannel.send("Pending version staged ready for deployment");
    } else {
        messageChannel.send("Failed to stage");
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.get("/deploy-pending", (req, res) => {
    var successfullyDeployed = true;
    if(successfullyDeployed) {
        messageChannel.send("Successfully deployed - ready for testing");
    } else {
        messageChannel.send("Failed to stage");
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.get("/confirm-pending", (req, res) => {
    var successfullyConfirmed = true;
    if(successfullyConfirmed) {
        messageChannel.send("Live instance updated\nTest instance removed");
    } else {
        messageChannel.send("Failed to deploy to live");
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.get("/", (req, res) => {
    messageChannel.send("Efficiency ++");
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

app.listen(8000, () => {
	console.log('Listening on port 8000!');
});


const discord = require('discord.js');
const client = new discord.Client();
require('dotenv').config();

client.on('ready', () => {
    client.user.setActivity("Ready for your command!");

    // Sets the channel to send messages to
    client.guilds.forEach((guild) => {
        if (guild.name.toLowerCase() === "flatfish") {
            guild.channels.forEach((channel) => {
                if (channel.name.toLowerCase() === "deployment") {
                    messageChannel = channel;
                } 
            });
        }
    });
});

client.on('message', (message) => {

    // Stop bot from replying to its messages
    if (message.author == client.user) {
        return;
    }

    // You can only use the bot in the deployment channel
    if (!(message.channel.name === "deployment")) {
        return;
    }

    // Only people with the 'Tester' role can use the bot 
    if (!message.member.roles.find(x => x.name.toLowerCase() === 'tester')) {
        message.channel.send("Sorry - you are not a tester");
        return;
    }

    // List commands you can use when you type help (or message containing help) - no need to tag the bot - but if you do it will still respond
    if (message.content.toLowerCase().includes("help")) {
        client.user.setActivity("Helping a friend!");
        message.channel.send('Remember to tag me in your command')
        message.channel.send(`check pending - check if there is already someting in testing environment\n`);
        message.channel.send(`set pending <branch> - gets specified branch ready to deploy to test\n`);
        message.channel.send(`deploy pending - spins up a container for the specified branch\n`);
        message.channel.send(`confirm pending - tears down live container and creates a new one with the new code\n`);
    }

    // Checks bot was @tagged in the message before response
    if (message.content.includes(client.user.id)) {
        respondToMessages(message);
    }
});


// Responds to the messages
function respondToMessages(message) {
    var channel = message.channel;

    console.log(message.channel);

    // The @bot will be at [0] so command will be at 1
    var command = message.content.split(" ")[1];
    var arguments = message.content.split(" ").slice(2);
    console.log(arguments);

    command = command.toLowerCase();

    if (command === "check") {
        if (arguments[0] === "pending") {
            fetch('http://www.flatfish.online:49163/check-pending');
            client.user.setActivity("Checking pending");
        }

        // Should check whether the test container is up - hit its url - response?
        // If no response - good to go
    }

    if (command === "deploy") {
        if (arguments[0] === "pending") {
            fetch('http://www.flatfish.online:49163/deploy-pending');
            client.user.setActivity("Deploying pending");
        }

        // Should spin up a new test container
        // To do this run a shell script that does it
    }

    if (command === "set") {
        if (arguments[0] === "pending") {
            fetch('http://www.flatfish.online:49163/set-pending');
            // channel.send(`Can't set ${arguments[1]} to pending right now`);
            client.user.setActivity("Setting pending");
        }

        // Should pull the code for the specified branch
    }

    if (command === "confirm") {
        if (arguments[0] === "pending") {
            fetch('http://www.flatfish.online:49163/confirm-pending');
            client.user.setActivity("Confirming pending");
        }

        // Should remove test container
        // Should restart live container with new code
    }
}

bot_secret_token = process.env.DISCORD_SECRET_TOKEN;

client.login(bot_secret_token);