// CROSS [NOW for the action] — carrier delivers the ball to a teammate within
// crossRange (longer than a pass). Cross interception is [FUTUR] (see
// crossInterceptRange on Piece).
import { isReceiver } from "../targeting";
import { endTurn } from "../turn";
import type { ActionHandler, CrossAction } from "../types";

export const crossHandler: ActionHandler<CrossAction> = (state, action) => {
  if (state.phase !== "PLAY") return state;

  const carrier = state.pieces.find((p) => p.id === action.pieceId);
  if (!carrier || carrier.team !== state.turn) return state;
  if (state.ball.carrierId !== carrier.id) return state;

  const receiver = state.pieces.find(
    (p) => p.x === action.to.x && p.y === action.to.y && p.team === carrier.team,
  );
  if (!receiver || !isReceiver(carrier, receiver, carrier.crossRange)) {
    return state;
  }

  // TODO(FUTUR): cross interception via crossInterceptRange.
  const ball = { x: receiver.x, y: receiver.y, carrierId: receiver.id };
  return endTurn({ ...state, ball });
};
