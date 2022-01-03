const Game = require('../models/game');

const axios = require("axios");


const downloadDatabase = async () => {
    const firstResponse = await axios.get("https://bad-api-assignment.reaktor.com/rps/history");

    console.log("Downloading history");

    try {
        await Game.insertMany(firstResponse.data.data, { ordered: false });
        console.log('Data from page');
    } catch (err) {
        console.log(err);
    }

    let cursor = firstResponse.data.cursor;

    let i = 1;
    while(cursor) {
        const response = await axios.get(`https://bad-api-assignment.reaktor.com${cursor}`);

        cursor = response.data.cursor

        try {
            await Game.insertMany(response.data.data, { ordered: false });
            console.log('Data from page');
        } catch (err) {
            console.log(err);
        }

        i+=1;
        console.log("Pages: ",i);
    }

    console.log("Finished loading database history")
}

module.exports = {downloadDatabase}