require('dotenv').config()

const host = process.env.HOST;
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const shell = require('shelljs');

const app = express().use(bodyParser.json());

app.use(express.static('public'));

var port = process.env.PORT
app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    var file = fs.readFileSync(process.cwd() + '/public/bot.html').toString();
    res.status(200).send(file);
})



app.get("/deploy", (req, res) => {
    shell.exec('./deploy.sh')
}) 