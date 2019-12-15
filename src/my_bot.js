const discord = require('discord.js');
const client = new discord.Client();
require('dotenv').config();

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name); 
        guild.channels.forEach((channel) => {
            console.log(`   - ${channel.name} ${channel.type} - ${channel.id}`);
        });
    });

    var testChannel = client.channels.get("655686477660815360");
    testChannel.send("Hello World!");
})

client.on('message', (message) => {
    if (message.author == client.user) {
        return;
    }

    message.channel.send(`${message.author.toString()} message: ${message.content}`);

    console.log(message.id.toString());
    console.log(client.user.id);
    console.log(message.content);
    console.log(message.content.includes(client.user.toString()));
    if (message.content.includes(client.user.id)) {
        respondToMessages(message);
    }

    if (message.content.toLowerCase() === ("help")) {
        message.channel.send('Remember to tag me in your message')
        message.channel.send(`deploy - used to deploy something\n other commands`);
    }


});

function respondToMessages(message) {
    console.log("Hi");
    var command = message.content.split(" ")[1];
    if (command.toLowerCase() == "deploy") {
        message.channel.send("Oh you want to deploy something? Cool!");
    }
}


bot_secret_token = process.env.DISCORD_SECRET_TOKEN;

client.login(bot_secret_token);