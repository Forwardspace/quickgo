// Note: reduplicated from the server folder because of the react-app restriction that
// every import must be within /src folder of the app

type PiecePosition = string | null;

export class GameState {
    id: number;

    player1: number | null = null;
    player2: number | null = null;
    currentPlayer: number = 1;

    boardSize!: number;
    boardState!: string

    lastUpdate: number;

    // Set up a boardSize X boardSize board of null pieces
    initializeBoard(boardSize: number) {
        this.boardSize = boardSize;

        var state: PiecePosition[][] = [];
        for (let i: number = 0; i < boardSize; i++) {
            state.push([] as PiecePosition[]);
            for (let j: number = 0; j < boardSize; j++) {
                state[i].push(null as PiecePosition);
            }
        }

        // Serialize the board state to allow storage in a DB
        this.boardState = JSON.stringify(state);
    }

    constructor(id: number = 0, playerId: number = 0, boardSize: number = 0) {
        this.id = id;
        this.player1 = playerId;
        if (boardSize > 0) {
            this.initializeBoard(boardSize);
        }
        
        this.lastUpdate = Date.now();
    }

    static fromDbData(dbdata: Record<string, any> | undefined) : GameState | undefined {
        if (dbdata === undefined) return undefined;

        var newGameState = new GameState();
        newGameState.id = dbdata["id"];
        newGameState.player1 = dbdata["player1"];
        newGameState.player2 = dbdata["player2"];
        newGameState.currentPlayer = dbdata["currentPlayer"];
        newGameState.boardSize = dbdata["boardSize"];
        newGameState.boardState = dbdata["boardState"];
        newGameState.lastUpdate = dbdata["lastUpdate"];
        return newGameState;
    }

    isPlayersTurn(playerId: number) {
        if (this.currentPlayer === 1) {
            return this.player1 === playerId;
        }
        else if (this.currentPlayer === 2) {
            return this.player2 === playerId;
        }
        return false;
    }

    setOtherPlayersTurn() {
        this.currentPlayer = this.currentPlayer == 1 ? 2 : 1;
    }

    executeMove(moveX: number, moveY: number) {
        var state = JSON.parse(this.boardState);

        if (state[moveY][moveX] != null) {
            // Space already filled - can't execute move
            return false;
        }

        state[moveY][moveX] = this.currentPlayer;
        this.setOtherPlayersTurn();

        this.boardState = JSON.stringify(state);
        this.lastUpdate = Date.now();

        return true;
    }
}