import { Fragment, useState } from "react";

import "./LandingPage.css";
import { useNavigate } from "react-router";

function getOrGenUserIDStr() : string {
    let strUserID = localStorage.getItem("userID");
    if (strUserID === null) {
        strUserID = String(Math.floor(Math.random() * 99999999));
        localStorage.setItem("userID", strUserID);
    }

    return strUserID;
}

async function createNewGame(boardSize: number) : Promise<number> {
    // Generate a 4-digit hex number
    let gameID = 4096 + Math.floor(Math.random() * 61438);

    let strUserID = getOrGenUserIDStr();

    // Send the data to the server
    let root = process.env.REACT_APP_BACKEND_ROOT || "http://localhost:8080";
    console.log("Request: " + root + "/creategame/" + String(gameID) + "/" + strUserID + "/" + String(boardSize));

    await fetch(
        root + "/creategame/" + String(gameID) + "/" + strUserID + "/" + String(boardSize),
        {
            method: "POST"
        }
    );

    return gameID;
}

async function joinGame(gameIDEncoded: string) : Promise<number> {
    // Decode the hex representation into the actual game ID
    let gameID = parseInt(gameIDEncoded, 16);

    let strUserID = getOrGenUserIDStr();

    let root = process.env.REACT_APP_BACKEND_ROOT || "http://localhost:8080";
    await fetch(
        root + "/joingame/" + String(gameID) + "/" + strUserID,
        {
            method: "POST"
        }
    );

    return gameID;
}

export function LandingPage() {
    var [joinTabOpen, setJoinTabOpen] = useState(false);
    var [boardSize, setBoardSize] = useState(9);
    var [gameIDStr, setGameIDStr] = useState("");

    let navigate = useNavigate();

    async function onClickCreate() {
        let gameID = await createNewGame(boardSize);
        navigate("/game/" + String(gameID));
    }

    async function onClickJoin() {
        let gameID = await joinGame(gameIDStr);
        navigate("/game/" + String(gameID));
    }

    return (
        <div className="landing-modal-container">
            <div className="landing-modal">
                <div className="landing-modal-tabstrip">
                    <button 
                        className={"landing-tab " + (joinTabOpen? "tab-white-on-black" : "tab-black-on-white")}
                        onClick={() => {setJoinTabOpen(false)}}
                    >
                        Create game
                    </button>
                    <button
                        className={"landing-tab " + (joinTabOpen? "tab-black-on-white" : "tab-white-on-black")}
                        onClick={() => {setJoinTabOpen(true)}}
                    >
                        Join game
                    </button>
                </div>
                <div className="landing-modal-content">
                    {joinTabOpen? (
                        <Fragment>
                            <input className="landing-input-gameid" type="text" placeholder="Game ID"
                                onChange={(e) => { setGameIDStr(e.target.value); }}
                            />
                            <button className="landing-button" onClick={onClickJoin}>Join</button>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <p className="landing-text">Board size:</p>
                            <input className="landing-input-size" type="number" min={3} max={25} defaultValue={9}
                                onChange={(e) => { setBoardSize(parseInt(e.target.value)); }}
                            />
                            <button className="landing-button" onClick={onClickCreate}>Create</button>
                        </Fragment>
                    )}
                </div>
            </div>
        </div>
    );
}