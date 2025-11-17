import { useState } from "react";

import "./Piece.css"

type PieceProps = {
    size: string;
    color: string;
    position: Array<number>;
    filled: boolean;
    onClickCallback: Function;
}

export function Piece(props: PieceProps) {
    let [clicked, setClicked] = useState(false);

    let className = "game-piece " + props.color + (props.filled || clicked? " filled" : "");
    let style = {
        width: props.size,
        height: props.size,
        left: props.position[0],
        top: props.position[1]
    };

    return (
        <div
            className={className}
            style={style}
            onClick={() => {props.onClickCallback(); setClicked(true);}} 
        />
    )
}