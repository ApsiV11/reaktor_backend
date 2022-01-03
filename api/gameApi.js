const mongoose = require('mongoose')
const Game = require('../models/game');

const config = require('../utils/config');

const gameRouter = require('express').Router();

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

let activeGames = {data: []};

if(mongoose.connection.readyState == 0) {
    mongoose.connect(config.DBADDRESS, {useNewUrlParser: true, useUnifiedTopology: true}).then(
        () => {
            console.log("Database connection state: " + mongoose.connection.readyState);
        },
        (err) => {
            console.log("Database error:" + err)
        }
    )
}

gameRouter.get('/history/:name', async (request, response) => {
    let name = request.params.name;
    console.log(name);
    const games = await Game
    .find({$or:[{"playerA.name": request.params.name}, {"playerB.name": request.params.name}]});
    response.json(games);
})

gameRouter.ws('/live', (ws, request) => {
    console.log('Socket Connected');
    ws.on("message", () => {
        const interval = setInterval(() => {
            if(ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(activeGames));
            }
            else {
                console.log("cleared");
                ws.terminate();
                clearInterval(interval);
            }
        }, 5000);
    })
})

//WebSocketClient for handling data coming from Reaktor api
client.on('connectFailed', (error) => {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', (connection) => {
    console.log('WebSocket Client Connected');
    connection.on('error', (error) => {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }

        const gameEvent = JSON.parse(JSON.parse(message.utf8Data));
        
        if(gameEvent.type=="GAME_BEGIN") {
            activeGames.data.push(gameEvent);
        }
        if(gameEvent.type=="GAME_RESULT") {
            Game.create(gameEvent, (err, small) => {
                if(err){
                    console.log(err);
                }
            });

            activeGames.data = activeGames.data.map((game) => game.gameId===gameEvent.gameId ? gameEvent : game);
        }
    });
    
});

client.connect('ws://bad-api-assignment.reaktor.com/rps/live', 'echo-protocol');

module.exports = gameRouter;