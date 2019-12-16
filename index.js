require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

const app = express()
app.use(bodyParser.json({
    verify: function(req, res, buf, encoding) {
        console.log(buf.toString());
    }
}));

var messageChannel;

function authenticateRequest(token) {
    if (token === process.env.CONFIRM_TOKEN) {
        return true;
    }

    return false;
}

app.post("/check-pending", (req, res) => {
    console.log(req.body);
    console.log(req.body.token);
    console.log(req.body.hasPendingVersion);
    if (!authenticateRequest(req.body.token)) { 
        return;
    }
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
        message.channel.send(`
        check <test/deploy> -- See if the environment is already in use
        list <test/deploy> <project> -- Lists all branches with "r-" at the start that are up to date with master and pass jenkins\n
        list testable <project> -- Lists all branches\n
        deploy <branch> -- Where branch must be in "list deployable"\n
        test <branch> -- pulls test branch and creates a docker test container for the code to run in
        confirm deployable <project> -- Confirms the deployment container, merges it to master and updates the project's container
        reject <deployable/testable> -- Takes down any deploy/test container thats running
        `)
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

    if (command === "list") {
        url = 'http://www.flatfish.online:49163/list';
        data = {"environment" : arguments[0]};
        requestData = {"method": "POST", "body": data};
        fetch(url, requestData);
        client.user.setActivity(`Getting list of ${arguments[0]}able branches`);

        // Get a list of branches to display to the user for their given request
        // Only show the ones that are eligible for testing
    }

    if (command === "check") {
        url = 'http://www.flatfish.online:49163/check';
        data = {"environment" : arguments[0]};
        requestData = {"method": "POST", "body": data};
        fetch(url, requestData);
        client.user.setActivity(`Checking if ${arguments[0]} environment is empty`);

        // Should check whether the test/deployment environment is in use - hit its url - response?
        // If no response - good to go
    }

    if (command === "deploy") {
        url = 'http://www.flatfish.online:49163/deploy';
        data = {"branch" : arguments[0]};
        requestData = {"method": "POST", "body": data};
        fetch(url, requestData);
        client.user.setActivity("Setting up deployment environment");
        
        // Should spin up a new development environment container for deployment candidate
        // To do this run a shell script that does it
    }

    if (command === "test") {
        url = 'http://www.flatfish.online:49163/test';
        data = {"branch" : arguments[0]};
        requestData = {"method": "POST", "body": data};
        fetch(url, requestData);
        client.user.setActivity("Setting up test environment");

        // Should spin up a new test container for testing a branch - doesn't need to be up to date
        // To do this run a shell script that does it
        // will always run on same port
    }

    if (command === "confirm") {
        if(arguments[1] === "deployable")
        {
            url = 'http://www.flatfish.online:49163/confirm-deploy';
            data = {"branch" : arguments[1], "project": arguments[2]};
            requestData = {"method": "POST", "body": data};
            fetch(url, requestData);
            client.user.setActivity("Shipping the new version");
            
            // Should remove correct development environment container container
            // Should restart live container with new code for the specified project
            // Should make sure that it is merged into master
        }
    }

    if (command === "reject") {
        url = 'http://www.flatfish.online:49163/reject';
        data = {"type" : arguments[0]};
        requestData = {"method": "POST", "body": data};
        fetch(url, requestData);
        client.user.setActivity(`Rejecting ${arguments[0]} environment`);

        // Destroy test/deployment environments without releasing
        // Makes way for other tests
    }
}

bot_secret_token = process.env.DISCORD_SECRET_TOKEN;

client.login(bot_secret_token);