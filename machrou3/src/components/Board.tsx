import "./Board.css";
import { useState } from "react";
import { players as initialPlayers } from "../game/formation";
import { initialGameState } from "../game/engine";
import ballImage from "../assets/BALL.png";

import PlayerPiece from "./Player";
import * as mouvement from "../game/mouvement";

const BOARD_HEIGHT = 17;
const BOARD_WIDTH = 29;





export default function Board() {

  const [gameState, setGameState] =useState(initialGameState);
  const players = gameState.players;
  const [selectedPlayerId, setSelectedPlayerId] =
  useState<string | null>(null);

  const selectedPlayer = players.find(
  p => p.id === selectedPlayerId
);


function isMoveSquare(
  x: number,
  y: number
) {
  if (!selectedPlayer) return false;
  const teammateOnSquare = players.find(
  p =>
    p.team === selectedPlayer.team &&
    p.x === x &&
    p.y === y
);

if (teammateOnSquare) {
  return false;
}

if (
  mouvement.teammateInPath(
    players,
    selectedPlayer,
    x,
    y
  )
) {
  return false;
}
  return mouvement.isMoveMatrix(x,y,selectedPlayer);
}

//makes every tyle clickable and checks what to do
function handleCellClick(
  x: number,
  y: number
) {
  if (!selectedPlayer) return;

  if (selectedPlayer.team !== gameState.turn) return;
  if (!isMoveSquare(x, y)) return;
setGameState(prev => {

  const newPlayers = mouvement.movePlayer(
    prev.players,
    selectedPlayer.id,
    x,
    y
  );

  let newBall = prev.ball;

  if (
    prev.ball.carrierId ===
    selectedPlayer.id
  ) {
    newBall = {
      ...prev.ball,
      x,
      y,
    };
  }

  return {
    ...prev,
    players: newPlayers,
    ball: newBall,

    turn:
      prev.turn === "HOME"
        ? "AWAY"
        : "HOME",
  };
});


  setSelectedPlayerId(null);
}


  const cells = [];

for (let y = -1; y < BOARD_HEIGHT+1; y++){ // throw in line being 1 in width added from both sides adds a 2 to the board height and width
    for (let x = -1; x < BOARD_WIDTH+1; x++){

      const isTopBorder =
        x<=BOARD_WIDTH-1 &&
        x>=0 &&
        y === -1;
      const isBottomBorder =
        x<=BOARD_WIDTH-1 &&
        x>=0 &&
        y === BOARD_HEIGHT;
      const isRightBorder =
        y<=BOARD_HEIGHT-1 &&
        y>=0 &&
        x === BOARD_WIDTH;
      const isLeftBorder =
        y<=BOARD_HEIGHT-1 &&
        y>=0 &&
        x === -1;

      const isTopGoalBorder =
        (((x<=5 && x>=0 )||(x<=28 && x>=23 )) && y === 2) ||
        (((x<=2 && x>=0 )||(x<=28 && x>=26 )) && y === 5);
      const isBottomGoalBorder =
        (((x<=5 && x>=0 )||(x<=28 && x>=23 )) && y === 14) ||
        (((x<=2 && x>=0 )||(x<=28 && x>=26 )) && y === 11);
      const isRightGoalBorder =
        ((y<=10 && y>=6 ) && x === 25) ||
        ((y<=13 && y>=3 ) && x === 22);
      const isLeftGoalBorder =
        ((y<=10 && y>=6 ) && x === 3) ||
        ((y<=13 && y>=3 ) && x === 6);


      const isTopGoalArea =
        x >= 0 &&
        x <= 5 &&
        y >= 3 &&
        y <= 13;

      const isBottomGoalArea =
        x >= 23 &&
        x <= 28 &&
        y >= 3 &&
        y <= 13;

      const isTopGoalLine =
        x >= 0 &&
        x <= 2 &&
        y >= 6 &&
        y <= 10;

      const isBottomGoalLine =
        x >= 26 &&
        x <= 28 &&
        y >= 6 &&
        y <= 10;

      const isCenterLine =  
        x === 14 &&
        y >= 0 &&
        y <= 16;

      const isCenterCircle =  
        (x-14)**2 + (y-8)**2 - 7 <=3 &&
        (x-14)**2 + (y-8)**2 - 7 >=0;// radius sqrt(7) and 3 is buffer meaning radius between sqrt(7) and sqrt (10)

      let className = "cell";

      if (isTopBorder || isTopGoalBorder) {
        className += " top-border";
      }
      if (isBottomBorder || isBottomGoalBorder) {
        className += " bottom-border";
      }
      if (isRightBorder || isLeftGoalBorder) {
        className += " right-border";
      }
      if (isLeftBorder || isRightGoalBorder) {
        className += " left-border";
      }

      if (isTopGoalArea || isBottomGoalArea) {
        className += " goal-area";
      }

      if (isTopGoalLine || isBottomGoalLine) {
        className += " goal-line";
      }
      if (isCenterLine) {
        className += " line-vertical";
      }
      if (isCenterCircle) {
        className += " center-circle";
      }
      if (isMoveSquare(x, y)) {
        className += " move-square";
      }

      cells.push(
        <div
          key={`${x}-${y}`}// +1 because the throw in line is added with a +2 so to center the field
          className={className}
          onClick={() =>
      handleCellClick(x, y)
    }
        />
      );
    }
  }
//calcul de l offset du ballon pour le dessin
const carrier = players.find(
  p => p.id === gameState.ball.carrierId
);

let ballOffsetX = 0;

if (carrier) {
  ballOffsetX =
    carrier.team === "HOME"
      ? 9
      : -9;
}
if (carrier) {

  const playersOnSameCell = players.filter(
    p =>
      p.x === carrier.x &&
      p.y === carrier.y
  );

  if (playersOnSameCell.length > 1) {
    ballOffsetX =
      carrier.team === "HOME"
        ? 5
        : -5;
  }
}
return (
  <div className="board-container">
    <div className="board">
      {cells}
    </div>

    {players.map((player) => {// mapping des joueurs

  const playersOnSameCell = players.filter(
    p =>
      p.x === player.x &&
      p.y === player.y
  );

  let offsetX = 0;

  if (playersOnSameCell.length > 1) {
    offsetX =
      player.team === "HOME"
        ? -8
        : 8;
  }

  return (
    <div
      key={player.id}
      className="player-wrapper"
      style={{
        left:
          (player.x + 1) * 24 + 3.9 + offsetX,
        top:
          (player.y + 1) * 24 + 3.9,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPlayerId(player.id);
      }}
    >
      <PlayerPiece player={player} />
    </div>
  );
  
})}
{carrier && (
  <div
    className="ball"
    style={{
      left:
        (gameState.ball.x + 1) * 24 + 0 + ballOffsetX,

      top:
        (gameState.ball.y + 1) * 24 ,
    }}
  >
    <img src={ballImage} alt="ball" />
  </div>
)}

  </div>
  
);
}
