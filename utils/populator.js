const Game = require('../models/game');
const Cursor = require('../models/cursor');

const transforms = require('./transforms')

const axios = require("axios");


//This function is invoked everytime the server startups. It loads the data from the reaktor api to update the mongodb data.
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

        //An example:
        //If the database has already the cursor the first page gives, this function will load the first page and also the second.
        //This ensures all the data is loaded.

        //Set cursor only after the check so that also the next page is loaded due to possible missing documents from the page.
        const thisPage=cursor.toString();
        cursor = response.data.cursor;

        //Check if this page's cursor is in the database.
        const isCursorFound = await Cursor.find({"cursor": thisPage});

        //This will end the data load to the this page
        if(isCursorFound.length>0 && thisPage===isCursorFound[0].cursor) {
            cursor = null;
        }
        else if(cursor && cursor!=="/rps/history"){
            await Cursor.create({"cursor": cursor});
        }

        //Insert data into MongoDB after adding the winner data
        try {
            await Game.insertMany(transforms.addWinners(response.data.data), { ordered: false });
            console.log('Data from page');
        } catch (err) {
            console.log("The game is already in the database: ", err)
        }
        console.log("Pages: ", i);
        i+=1;
    }

    console.log("Finished loading database history")
}

module.exports = {downloadDatabase}