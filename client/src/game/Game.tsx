import { useNavigate, useParams } from "react-router"

import { GameBoard } from "./GameBoard.tsx"

import "./Game.css";
import { useEffect, useState } from "react";
import { useInterval } from "../useinterval.ts";
import { GameState } from "../GameState.ts";

const POLLING_RATE = 500;

async function getGameState(userIDStr: string, gameIDStr: string | undefined) : Promise<GameState | undefined> {
    if (gameIDStr === undefined) {
        console.error("No game ID supplied");
        return undefined;
    }

    let root = process.env.REACT_APP_BACKEND_ROOT || "http://localhost:8080";
    return GameState.fromDbData(await (await fetch(root + "/getgamestate/" + gameIDStr + "/" + userIDStr)).json());
}

function getOtherPlayerID(player: number, gamestate: GameState) : number | null {
    if (gamestate === null) {
        return null;
    }

    return player === gamestate.player1 ? gamestate.player2 : gamestate.player1;
}

async function makeMove(player: number, game: number, gamestate: GameState, y: number, x: number) {
    if (isThisPlayersTurn(player, gamestate) && gamestate.executeMove(x, y)) {
        let root = process.env.REACT_APP_BACKEND_ROOT || "http://localhost:8080";
        await fetch(root + "/makemove/" + String(game) + "/" + String(player) + "/" + String(x) + "/" + String(y), {method: "POST"});
    }
}

function isThisPlayersTurn(player : number, gamestate : GameState) : boolean {
    if (gamestate === null) {
        return false;
    }

    return gamestate.isPlayersTurn(player);
}

function isThisPlayerBlack(player: number, gamestate: GameState) : boolean {
    if (gamestate === null) {
        return false;
    }

    return player === gamestate.player1;
}

export function Game() {
    let params = useParams();
    let navigate = useNavigate();

    let [gameState, setGameState] : [any, any] = useState(null);

    let userID = parseInt(localStorage.getItem("userID") as string);
    let gameID = parseInt(params.id!);

    useInterval(async () => {
        setGameState(await getGameState(String(userID), String(gameID)));
    }, POLLING_RATE);

    return (
        <div className="game-container-bg">
            <div className="game-container">
                <div className="game-details-container">
                    <div className={"game-info-container " + (isThisPlayerBlack(userID, gameState)? "gi-container-white" : "gi-container-black")}>
                        <h2>Game ID:</h2>
                        <h1>{gameID.toString(16)}</h1>
                    </div>
                    <h3>Playing against:</h3>
                    <h3>{getOtherPlayerID(userID, gameState) === null ? "(nobody connected)" : String(getOtherPlayerID(userID, gameState))}</h3>
                    <div className="spacer" />
                    <h3>{isThisPlayersTurn(userID, gameState) ? "Your turn." : "Their turn."}</h3>
                    <div className="game-control-container">
                        <button className="game-control-button" onClick={() => navigate("/")}>Exit game</button>
                    </div>
                </div>
                <div className="game-board-container">
                    { gameState && (
                        <GameBoard 
                            boardSize={gameState.boardSize}
                            boardState={JSON.parse(gameState.boardState)}
                            isCurrentPlayersTurn={isThisPlayersTurn(userID, gameState)}
                            isCurrentPlayerBlack={isThisPlayerBlack(userID, gameState)}
                            onClickCallback={makeMove.bind(this, userID, gameID, gameState)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}