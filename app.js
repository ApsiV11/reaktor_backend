const express = require('express');

const app = express();
var expressWs = require('express-ws')(app);

const gameApi = require('./api/gameApi')

//Populate the database with historical data
const populator = require('./utils/populator')
populator.downloadDatabase()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.use('/rps', gameApi);

app.listen(8080)