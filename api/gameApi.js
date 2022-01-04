const mongoose = require('mongoose')
const Game = require('../models/game');

const config = require('../utils/config');
const transforms = require('../utils/transforms')

const gameRouter = require('express').Router();

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

let activeGames = {data: []};

//DB Connection initializing
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

//Api end point /history/:name for getting historical data per player easily.
gameRouter.get('/history/:name', async (request, response) => {
    let name = request.params.name;
    const games = await Game
    .find({$or:[{"playerA.name": request.params.name}, {"playerB.name": request.params.name}]});
    response.json(games);
})

//Websocket for redirecting data coming for the Reaktor api. Now sends active games every 5 seconds.
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

//On connection
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

        //Parse data two times because of string escaping
        let gameEvent = JSON.parse(JSON.parse(message.utf8Data));
        
        //If the event is GAME_BEGIN just put in the array of activeGames
        if(gameEvent.type=="GAME_BEGIN") {
            activeGames.data.push(gameEvent);
        }

        //If the event is GAME_RESULT push it also to MongoDB and update it to array
        if(gameEvent.type=="GAME_RESULT") {
            gameEvent = transforms.addWinners([gameEvent])[0];
            Game.create(gameEvent, (err, small) => {
                if(err){
                    console.log(err);
                }
            });

            setTimeout(() => {
                activeGames.data = activeGames.data.filter((game) => game.gameId!==gameEvent.gameId);
            }, 30000);

            activeGames.data = activeGames.data.map((game) => game.gameId===gameEvent.gameId ? gameEvent : game);
        }
    });
    
});

client.connect('ws://bad-api-assignment.reaktor.com/rps/live', 'echo-protocol');

module.exports = gameRouter;