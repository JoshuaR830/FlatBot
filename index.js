require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const request = require('request');
const discord = require('discord.js');
const client = new discord.Client();
require('dotenv').config();

const app = express()

var messageChannel;
var bot_secret_token = process.env.DISCORD_SECRET_TOKEN;

client.login(bot_secret_token);

app.use(bodyParser.json({
    verify: function(req, res, buf, encoding) {
        console.log(buf.toString());
    }
}));


app.listen(8000, () => {
	console.log('Listening on port 8000!');
});

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



function authenticateRequest(token) {
    if (token === process.env.CONFIRM_TOKEN) {
        return true;
    }

    return false;
}


// When a message is recieved some checks run
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
        sendHelp();
    }

    // Checks bot was @tagged in the message before response
    if (message.content.includes(client.user.id)) {
        respondToMessages(message);
    }
});

// First stage to responding to messages handled here
// The available commands are programmed in here
// When commands all they do is send a post request to the backend bot project
// That is where all of the magic will happen - e.g creating new containers, getting the lists
function respondToMessages(message) {
    var channel = message.channel;

    console.log(message.channel);

    // The @bot will be at [0] so command will be at 1
    var command = message.content.split(" ")[1];
    var arguments = message.content.split(" ").slice(2);
    console.log(arguments);

    command = command.toLowerCase();

    if (command === "list") {
        request.post(
            'http://www.flatfish.online:49163/list',
            { json : { environment: arguments[0] } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
        client.user.setActivity(`Getting list of ${arguments[0]}able branches`);

        // Get a list of branches to display to the user for their given request
        // Only show the ones that are eligible for testing
    }

    if (command === "check") {
        request.post(
            'http://www.flatfish.online:49163/check',
            { json : { environment: arguments[0] } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
        client.user.setActivity(`Checking if ${arguments[0]} environment is empty`);

        // Should check whether the test/deployment environment is in use - hit its url - response?
        // If no response - good to go
    }

    if (command === "deploy") {
        request.post(
            'http://www.flatfish.online:49163/deploy',
            { json : { branch: arguments[0] } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
        client.user.setActivity("Setting up deployment environment");
        
        // Should spin up a new development environment container for deployment candidate
        // To do this run a shell script that does it
    }

    if (command === "test") {
        request.post(
            'http://www.flatfish.online:49163/test',
            { json : { branch: arguments[0] } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
        client.user.setActivity("Setting up test environment");

        // Should spin up a new test container for testing a branch - doesn't need to be up to date
        // To do this run a shell script that does it
        // will always run on same port
    }

    if (command === "confirm") {
        if(arguments[1] === "deployable")
        {
            request.post(
                'http://www.flatfish.online:49163/confirm-deploy',
                { json : { branch: arguments[1], project: arguments[2] } },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    }
                }
            );
            client.user.setActivity("Shipping the new version");
            
            // Should remove correct development environment container container
            // Should restart live container with new code for the specified project
            // Should make sure that it is merged into master
        }
    }

    if (command === "reject") {
        request.post(
            'http://www.flatfish.online:49163/reject',
            { json : { environment : arguments[0] } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
        client.user.setActivity(`Rejecting ${arguments[0]} environment`);

        // Destroy test/deployment environments without releasing
        // Makes way for other tests
    }
}



// This section deals with the response that the server sends back
// The server sends back all of the values as post requests
// All of the data can now be used to send messages back to the user


// Sends a help message to Discord - also updates status which is cool
function sendHelp() {
    client.user.setActivity("Helping a friend!");
    message.channel.send('Remember to tag me in your command')
    message.channel.send(`
    check <test/deploy> -- See if the environment is already in use
    list <test/deploy> <project> -- Lists all branches with "r-" at the start that are up to date with master and pass jenkins
    list testable <project> -- Lists all branches
    deploy <branch> -- Where branch must be in "list deployable"
    test <branch> -- pulls test branch and creates a docker test container for the code to run in
    confirm deployable <project> -- Confirms the deployment container, merges it to master and updates the project's container
    reject <deployable/testable> -- Takes down any deploy/test container thats running
    `)
}


// Send a list back to the user
// List contains all branches that can be used in specifieed environment
// Certain conditions must be met for this
app.post("/list", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }
    let list = req.body.list;

    messageChannel.send(`Here are all of the branches for ${req.body.environment}:`);
    list.forEach(branch => messageChannel.send(`> ${branch}`))
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})


// This checks the requested environment contains an incomplete test/deploy candidate
// Will tell you to wait if there is another thing being tested/deployed
app.post("/check", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }
    let environment = req.body.environment;

    if (req.body.hasPendingVersion) {
        messageChannel.send(`Wait a minute - there's a pending version in the ${environment} environment`);
    } else {
        messageChannel.send(`All clear - no pending versions in the ${environment} environment`);
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

// This will up a new docker container for a deployment candidate
// A new instance of the server will be available
// deploy.flatfish.online
app.post("/deploy", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }

    if (req.body.isInDeploy) {
        messageChannel.send(`Successfully deployed ${req.body.branch} to dev`);
    } else {
        messageChannel.send(`Failed to deploy ${req.body.branch} to dev`);
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

// This will up a new docker container for a test candidate
// A new instance of the server will be available
// test.flatfish.online
app.post("/testing", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }

    if (req.body.isInTest) {
        messageChannel.send(`${req.body.branch} is in test environment `);
    } else {
        messageChannel.send(`Failed to start test environment`);
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

// When confirmed the code in the deployment candidate container will be removeed
// The code will then go live - replacing the existing live environment
app.post("/confirm-deployable", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }

    if (req.body.isLive) {
        messageChannel.send(`${req.body.project} successfully went live with ${req.body.branch}`);
    } else {
        messageChannel.send(`${req.body.project} failed to go live with ${req.body.branch}`);
    }
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

// This will be used to tear down docker containers that have been finished with
// Removes a test/deploy candidate from the container ready for someone else to use
app.post("/reject", (req, res) => {
    if (!authenticateRequest(req.body.token)) { 
        return;
    }

    if (req.body.isRejected) {
        messageChannel.send(`${req.body.environment} has been rejected`);
    } else {
        messageChannel.send(`failed to reject ${req.body.environment}`);
    }
})

// Would be cool if going here gave you a nice page explaining how the bot works
// Help to understand what to do
// Also sends a help message to discord - how useful!
app.get("/", (req, res) => {
    sendHelp();
    client.user.setActivity("Ready for your command!");
    res.status(200).send("Sent message to discord");
})

