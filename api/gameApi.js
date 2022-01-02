const { request } = require('express')
const Game = require('../models/game')

const gameRouter = require('express').Router()

gameRouter.get('/history/:name', async (request, response) => {
    const games = await Game
    .find({$or:[{"playerA.name": request.params.name}, {"playerB.name": request.params.name}]})
    response.json(games)
})

gameRouter.ws('/live', (ws, request) => {
    ws.on('message', )
})