import "./Board.css";
import { useGameStore } from "../state/gameStore";
import { attackDir, attackingGoalX, GOAL, GRID } from "../game/rules";
import * as movement from "../game/movement";
import { canDribbleOnto, canShoot, isReceiver } from "../game/targeting";
import type { Piece } from "../game/types";
import Tile from "./Tile";
import PieceView from "./PieceView";
import BallView from "./BallView";

const BOARD_HEIGHT = GRID.height;
const BOARD_WIDTH = GRID.width;
const CELL = 24; // px, must match Board.css grid cell size

export default function Board() {
  const state = useGameStore((s) => s.state);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const actionMode = useGameStore((s) => s.actionMode);
  const select = useGameStore((s) => s.select);
  const dispatch = useGameStore((s) => s.dispatch);

  const pieces = state.pieces;
  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);
  const playable = state.phase === "PLAY";
  const isCarrier = !!selectedPiece && state.ball.carrierId === selectedPiece.id;

  /** Highlight depends on the current action mode. */
  function isHighlight(x: number, y: number) {
    if (!selectedPiece || selectedPiece.team !== state.turn || !playable) {
      return false;
    }
    if (actionMode === "MOVE") {
      const dir = attackDir(selectedPiece.team, state.half);
      return movement.isLegalMove(pieces, selectedPiece, x, y, dir);
    }
    if (actionMode === "DRIBBLE") {
      // highlight opposing pieces the carrier can dribble onto
      if (!isCarrier) return false;
      const dir = attackDir(selectedPiece.team, state.half);
      return pieces.some(
        (p) => p.x === x && p.y === y && canDribbleOnto(pieces, selectedPiece, p, dir),
      );
    }
    if (actionMode === "SHOOT") {
      // highlight the attacked goal mouth (aim point for the shot)
      if (!isCarrier || !canShoot(selectedPiece, state.half)) return false;
      return (
        x === attackingGoalX(selectedPiece.team, state.half) &&
        y >= GOAL.yMin &&
        y <= GOAL.yMax
      );
    }
    // PASS / CROSS: highlight reachable teammates' tiles.
    if (!isCarrier) return false;
    const range =
      actionMode === "PASS" ? selectedPiece.passRange : selectedPiece.crossRange;
    return pieces.some(
      (p) => p.x === x && p.y === y && isReceiver(selectedPiece, p, range),
    );
  }

  function handleCellClick(x: number, y: number) {
    if (!selectedPiece) return;
    if (!isHighlight(x, y)) return;
    if (actionMode === "MOVE") {
      dispatch({ type: "MOVE", pieceId: selectedPiece.id, to: { x, y } });
    } else if (actionMode === "SHOOT") {
      dispatch({ type: "SHOT", pieceId: selectedPiece.id, to: { x, y } });
    }
  }

  function handlePieceClick(piece: Piece) {
    if (!playable) return;

    // In PASS/CROSS mode, clicking a valid teammate delivers the ball.
    if (
      selectedPiece &&
      isCarrier &&
      (actionMode === "PASS" || actionMode === "CROSS")
    ) {
      const range =
        actionMode === "PASS"
          ? selectedPiece.passRange
          : selectedPiece.crossRange;
      if (isReceiver(selectedPiece, piece, range)) {
        dispatch({
          type: actionMode,
          pieceId: selectedPiece.id,
          to: { x: piece.x, y: piece.y },
        });
        return;
      }
    }

    // In DRIBBLE mode, clicking a reachable opponent starts a duel.
    if (selectedPiece && isCarrier && actionMode === "DRIBBLE") {
      const dir = attackDir(selectedPiece.team, state.half);
      if (canDribbleOnto(pieces, selectedPiece, piece, dir)) {
        dispatch({
          type: "DRIBBLE",
          pieceId: selectedPiece.id,
          defenderId: piece.id,
        });
        return;
      }
    }

    // Otherwise (de)select — only the side to move may select.
    if (piece.team !== state.turn) return;
    select(selectedPieceId === piece.id ? null : piece.id);
  }

  const cells = [];
  for (let y = -1; y < BOARD_HEIGHT + 1; y++) {
    // throw-in line of width 1 added on both sides => +2 to board height/width
    for (let x = -1; x < BOARD_WIDTH + 1; x++) {
      const isTopBorder = x <= BOARD_WIDTH - 1 && x >= 0 && y === -1;
      const isBottomBorder =
        x <= BOARD_WIDTH - 1 && x >= 0 && y === BOARD_HEIGHT;
      const isRightBorder = y <= BOARD_HEIGHT - 1 && y >= 0 && x === BOARD_WIDTH;
      const isLeftBorder = y <= BOARD_HEIGHT - 1 && y >= 0 && x === -1;

      const isTopGoalBorder =
        (((x <= 5 && x >= 0) || (x <= 28 && x >= 23)) && y === 2) ||
        (((x <= 2 && x >= 0) || (x <= 28 && x >= 26)) && y === 5);
      const isBottomGoalBorder =
        (((x <= 5 && x >= 0) || (x <= 28 && x >= 23)) && y === 14) ||
        (((x <= 2 && x >= 0) || (x <= 28 && x >= 26)) && y === 11);
      const isRightGoalBorder =
        (y <= 10 && y >= 6 && x === 25) || (y <= 13 && y >= 3 && x === 22);
      const isLeftGoalBorder =
        (y <= 10 && y >= 6 && x === 3) || (y <= 13 && y >= 3 && x === 6);

      const isTopGoalArea = x >= 0 && x <= 5 && y >= 3 && y <= 13;
      const isBottomGoalArea = x >= 23 && x <= 28 && y >= 3 && y <= 13;

      const isTopGoalLine = x >= 0 && x <= 2 && y >= 6 && y <= 10;
      const isBottomGoalLine = x >= 26 && x <= 28 && y >= 6 && y <= 10;

      const isCenterLine = x === 14 && y >= 0 && y <= 16;

      // radius between sqrt(7) and sqrt(10) (7 + buffer of 3)
      const isCenterCircle =
        (x - 14) ** 2 + (y - 8) ** 2 - 7 <= 3 &&
        (x - 14) ** 2 + (y - 8) ** 2 - 7 >= 0;

      let className = "cell";
      if (isTopBorder || isTopGoalBorder) className += " top-border";
      if (isBottomBorder || isBottomGoalBorder) className += " bottom-border";
      if (isRightBorder || isLeftGoalBorder) className += " right-border";
      if (isLeftBorder || isRightGoalBorder) className += " left-border";
      if (isTopGoalArea || isBottomGoalArea) className += " goal-area";
      if (isTopGoalLine || isBottomGoalLine) className += " goal-line";
      if (isCenterLine) className += " line-vertical";
      if (isCenterCircle) className += " center-circle";
      if (isHighlight(x, y)) {
        if (actionMode === "MOVE") className += " move-square";
        else if (actionMode === "DRIBBLE") className += " dribble-square";
        else if (actionMode === "SHOOT") className += " shoot-square";
        else className += " target-square";
      }

      cells.push(
        <Tile
          key={`${x}-${y}`}
          className={className}
          onClick={() => handleCellClick(x, y)}
        />,
      );
    }
  }

  // ball draw offset when shared with its carrier
  const carrier = pieces.find((p) => p.id === state.ball.carrierId);
  let ballOffsetX = 0;
  if (carrier) {
    ballOffsetX = carrier.team === "HOME" ? 9 : -9;
    const stacked = pieces.filter(
      (p) => p.x === carrier.x && p.y === carrier.y,
    );
    if (stacked.length > 1) ballOffsetX = carrier.team === "HOME" ? 5 : -5;
  }

  return (
    <div className="board-container">
      <div className="board">{cells}</div>

      {pieces.map((piece) => {
        const stacked = pieces.filter(
          (p) => p.x === piece.x && p.y === piece.y,
        );
        const offsetX = stacked.length > 1 ? (piece.team === "HOME" ? -8 : 8) : 0;
        const color =
          piece.team === "HOME"
            ? state.config.homeColor
            : state.config.awayColor;

        return (
          <div
            key={piece.id}
            className="player-wrapper"
            style={{
              left: (piece.x + 1) * CELL + 3.9 + offsetX,
              top: (piece.y + 1) * CELL + 3.9,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePieceClick(piece);
            }}
          >
            <PieceView
              piece={piece}
              color={color}
              selected={piece.id === selectedPieceId}
              selectable={playable && piece.team === state.turn}
            />
          </div>
        );
      })}

      {carrier && (
        <BallView
          left={(state.ball.x + 1) * CELL + ballOffsetX}
          top={(state.ball.y + 1) * CELL}
        />
      )}
    </div>
  );
}
