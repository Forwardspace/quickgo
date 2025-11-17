import { Fragment, useRef, useCallback, useState } from "react";
import GridLines from "react-gridlines";

import "./GameBoard.css";

import { Piece } from "./Piece.tsx";

type GameBoardProps = {
    boardSize: number;
    boardState: Array<string>;
    isCurrentPlayerBlack: boolean;
    isCurrentPlayersTurn: boolean;
    onClickCallback: Function;
}

export function GameBoard(props: GameBoardProps) {
    let [dimensions, setDimensions] = useState([0, 0]);

    let gridLinesRef = useCallback((node: GridLines) => {
        if (node == null) return;
        let bounds = node.getBoundingClientRect();

        setDimensions([bounds.width, bounds.height]);
    }, []);

    let correctiveOffset = 0.192;
    let cellWidth = dimensions[0] / (props.boardSize - 1) - correctiveOffset;
    let pieceSize = (1 / props.boardSize) * 720;
    
    function getPiecePosition(y: number, x: number) {
        const offsetX = 0.055 * dimensions[0] - pieceSize/2;   // Board grid is not 100% of parent container w/h
        const offsetY = 0.055 * dimensions[1] - pieceSize/2;   // Therefore move the pieces a bit to the right and down to match
        
        return [offsetX + x * cellWidth, offsetY + y * cellWidth];
    }

    function getPieceColor(y: number, x: number) {
        if (props.boardState[y][x] == null) {
            return props.isCurrentPlayerBlack? "black" : "white";
        }

        return props.boardState[y][x] == "1"? "black" : "white";
    }

    let pieces = []
    for (let i = 0; i < props.boardState.length; i++) {
        for (let j = 0; j < props.boardState[0].length; j++) {
            // Do not show unfilled pieces if it's not the current player's turn
            // This disables the on hover effects of the empty board spaces
            if (!props.isCurrentPlayersTurn && props.boardState[i][j] == null) continue;

            pieces.push(
                <Piece 
                    size={String(pieceSize) + "px"}
                    position={getPiecePosition(i, j)}
                    filled={props.boardState[i][j] != null}
                    color={getPieceColor(i, j)}
                    onClickCallback={props.onClickCallback.bind(this, i, j)}
                />
            );
        }
    }

    return (
        <Fragment>
            <GridLines ref={gridLinesRef} className="game-grid-decorative" cellWidth={cellWidth} strokeWidth={2} />
            {pieces}
        </Fragment>
    );
}