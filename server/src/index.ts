import express, { Request, Response } from "express"
import cors from "cors";
import sqlite, { DatabaseSync } from "node:sqlite"

import { GameState } from "./gamestate"

const PORT = process.env.PORT || 8080;

const app = express();
const database = new DatabaseSync(":memory:");

app.use(express.json());
app.use(cors());

database.exec(`
    CREATE TABLE game (
        id INTEGER PRIMARY KEY,
        player1 INTEGER,
        player2 INTEGER,
        currentPlayer INTEGER,
        boardSize INTEGER NOT NULL,
        boardState TEXT NOT NULL,
        lastUpdate INTEGER NOT NULL
    ) STRICT
`);

const getGameStateById = database.prepare("SELECT * FROM game WHERE id = ?");
const addGameState = database.prepare("INSERT INTO game (id, player1, player2, currentPlayer, boardSize, boardState, lastUpdate) VALUES (?, ?, ?, ?, ?, ?, ?)");
const setGameStatePlayer2 = database.prepare("UPDATE game SET player2 = ? WHERE id = ?");
const setGameState = database.prepare("UPDATE game SET player1 = ?, player2 = ?, currentPlayer = ?, boardSize = ?, boardState = ?, lastUpdate = ? WHERE id = ?");
const deleteGameState = database.prepare("DELETE FROM game WHERE id = ?");
const deleteUnusedStates = database.prepare("DELETE FROM game WHERE lastUpdate < ?");

const UNUSED_STATE_TIME = 1000 * 60 * 60;   // One hour or more without updates is considered an abandoned game

function cleanStates() {
    deleteUnusedStates.run(Date.now() - UNUSED_STATE_TIME);
}

app.get("/getgamestate/:id/:playerid", (request: Request, response: Response) => {
    const gameId = parseInt(request.params.id);
    const playerId = parseInt(request.params.playerid);

    const state = GameState.fromDbData(getGameStateById.get(gameId));
    if (state === undefined) {
        response.status(404).send();
    }
    else {
        if (state.player1 === playerId || state.player2 === playerId) {
            response.json(state);
        }
        else {
            response.status(403).send();
        }
    }
});
app.post("/creategame/:id/:playerid/:boardsize", (request: Request, response: Response) => {
    cleanStates();

    const gameId = parseInt(request.params.id);
    const playerId = parseInt(request.params.playerid);
    const boardSize = parseInt(request.params.boardsize);

    var newState = new GameState(gameId, playerId, boardSize);
    addGameState.run(newState.id, newState.player1, newState.player2, newState.currentPlayer, newState.boardSize, newState.boardState, newState.lastUpdate);

    response.status(200).send();
});
app.post("/joingame/:id/:playerid", (request: Request, response: Response) => {
    cleanStates();

    const gameId = parseInt(request.params.id);
    const playerId = parseInt(request.params.playerid);

    const state = GameState.fromDbData(getGameStateById.get(gameId));
    if (state === undefined) {
        response.status(404).send();
    }
    else {
        // Player 1 can't be null - that's the host. Therefore, check only
        // if Player 2 hasn't joined yet
        if (state.player2 === null) {
            setGameStatePlayer2.run(playerId, gameId);
            response.status(200).send();
        }
        else {
            response.status(422).send();
        }
    }
});
app.post("/makemove/:id/:playerid/:movex/:movey", (request: Request, response: Response) => {
    const gameId = parseInt(request.params.id);
    const playerId = parseInt(request.params.playerid);
    const moveX = parseInt(request.params.movex);
    const moveY = parseInt(request.params.movey);

    var state = GameState.fromDbData(getGameStateById.get(gameId))
    if (state === undefined) {
        response.status(404).send();
    }
    else {
        // Execute the move only if the player is part of the game and
        // it's currently their turn
        if ((state.player1 === playerId || state.player2 === playerId) && state.isPlayersTurn(playerId)) {
            if (state.executeMove(moveX, moveY)) {
                setGameState.run(state.player1, state.player2, state.currentPlayer, state.boardSize, state.boardState, state.lastUpdate, state.id);
                response.status(200).send();                
            }
            else {
                response.status(403).send();
            }
        }
        else {
            response.status(403).send();
        }
    }
})
app.delete("/deletegame/:id/:playerid", (request: Request, response: Response) => {
    cleanStates();

    const gameId = parseInt(request.params.id);
    const playerId = parseInt(request.params.playerid);

    var state = GameState.fromDbData(getGameStateById.get(gameId))
    if (state === undefined) {
        response.status(404).send();
    }
    else if (state.player1 === playerId || state.player2 === playerId) {
        deleteGameState.run(gameId);
        response.status(200).send();
    }
    else {
        response.status(403).send();
    }
});
app.listen(PORT, () => {
    console.log("Started listening at 8080");
})