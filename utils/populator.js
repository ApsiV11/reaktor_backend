const Game = require('../models/game');

const transforms = require('./transforms')

const axios = require("axios");

const downloadDatabase = async () => {
    console.log("Downloading history");

    let cursor = "/rps/history";

    let i = 1;
    while(cursor) {

        let response = null;
        try {
            response = await axios.get(`https://bad-api-assignment.reaktor.com${cursor}`);
        } catch(err) {
            console.log(err);
            continue;
        }

        //Update the cursor to point it to the next page
        cursor = response.data.cursor;

        //Insert data into MongoDB after adding the winner data
        try {
            await Game.insertMany(transforms.addWinners(response.data.data), { ordered: false });
            console.log('Data from page');
        } catch (err) {
            console.log(err);
        }
        console.log("Pages: ", i);
        i+=1;
    }

    console.log("Finished loading database history")
}

module.exports = {downloadDatabase}