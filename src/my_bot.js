const express = require('express');
const bodyParser = require('body-parser');
const shell = require('shelljs');

const app = express().use(bodyParser.json());

app.use(express.static('public'));

var messageChannel;

app.get("/", (req, res) => {
    messageChannel.send("Efficiency ++");
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
            channel.send("Can't check pending right now");
            client.user.setActivity("Checking pending");
        }

        // Should check whether the test container is up - hit its url - response?
        // If no response - good to go
    }

    if (command === "deploy") {
        if (arguments[0] === "pending") {
            channel.send("Can't deploy pending right now");
            client.user.setActivity("Deploying pending");
        }

        // Should spin up a new test container
        // To do this run a shell script that does it
    }

    if (command === "set") {
        if (arguments[0] === "pending") {
            channel.send(`Can't set ${arguments[1]} to pending right now`);
            client.user.setActivity("Setting pending");
        }

        // Should pull the code for the specified branch
    }

    if (command === "confirm") {
        if (arguments[0] === "pending") {
            channel.send("Can't confirm pending right now");
            client.user.setActivity("Confirming pending");
        }

        // Should remove test container
        // Should restart live container with new code
    }

    client.user.setActivity("Ready for your command!");
}

bot_secret_token = process.env.DISCORD_SECRET_TOKEN;

client.login(bot_secret_token);