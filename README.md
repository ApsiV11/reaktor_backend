# reaktor_backend

#Reaktor pre-assignment 2022 for Summer Developers
This is my solution for the Reaktor pre-assignment 2022 for Summer Developers. This repository has the code for the Node.js backend as well as the built version of the React frontend.
The code for the frontend can be viewed at https://github.com/ApsiV11/reaktor.

## Running locally
The project can be run two ways.

After cloning the repository, you can use docker-compose to set up the project by running in the root directory:
```
docker-compose up
```
or you can set up an '.env'-file by setting an "DBADDRESS"-enviroment variable to point at your mongoDB database of choice. The first alternative is better, since a it setups the database locally.

After setting up and running the project, head to `localhost:8080` and the web application should work.

## The keypoints in my implementation

1. The /rps/history API endpoint was the biggest problem during the project. Since each page had a cursor to the next, each page has to be loaded one after another to load all the data. I solved this by loading all the historical data into the backend and putting in to a database. Then when new games are completed, they are also put in to the database.
2. The /rps/live API is just forwarded through the backend by another websocket API. This data is put into an array in the frontend and when the games are completed, the games are deleted 30 seconds after from the array.
3. Before a game is put into the database, the winner is added to the data. This makes it faster to calculate the winning percentage.
4. Player data can be viewed by clicking a player name. After that the backend loads all the games with our wanted player and sends them to the frontend. Win percentage, most played hand and total game count are calculated in the frontend.

#Issues
1. The live version of the app is quite slow. This is due to the fact that there is so much data as of 6.1.2022. Another reason is also the fact that the app is using a free MongoDB Atlas cluster so the bandwith is limited and the queries take much longer than an a local instance.
2. The fetching of the data in the start needs to take in to account the data already on the database. This can be done by also saving the cursors to the database. This way if the server has down time we can load data until the data "hole" is filled.
