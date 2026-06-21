// MOVE [NOW] — relocate a piece to a legal tile; the ball follows its carrier.
// Consumes a turn (only) on success; illegal moves are no-ops.
import { attackDir } from "../rules";
import { movePiece } from "../movement";
import { endTurn } from "../turn";
import type { ActionHandler, MoveAction } from "../types";

export const moveHandler: ActionHandler<MoveAction> = (state, action) => {
  if (state.phase !== "PLAY") return state;

  const piece = state.pieces.find((p) => p.id === action.pieceId);
  if (!piece || piece.team !== state.turn) return state;

  const dir = attackDir(piece.team, state.half);
  const newPieces = movePiece(
    state.pieces,
    action.pieceId,
    action.to.x,
    action.to.y,
    dir,
  );
  // movePiece returns the same reference when the move is illegal.
  if (newPieces === state.pieces) return state;

  const ball =
    state.ball.carrierId === action.pieceId
      ? { ...state.ball, x: action.to.x, y: action.to.y }
      : state.ball;

  return endTurn({ ...state, pieces: newPieces, ball });
};
