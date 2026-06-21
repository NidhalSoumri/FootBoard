// PASS [NOW] — carrier delivers the ball to a teammate within passRange.
// passRange is signed (+ square / - circular). Pass interception is [FUTUR].
import { isReceiver } from "../targeting";
import { endTurn } from "../turn";
import type { ActionHandler, PassAction } from "../types";

export const passHandler: ActionHandler<PassAction> = (state, action) => {
  if (state.phase !== "PLAY") return state;

  const carrier = state.pieces.find((p) => p.id === action.pieceId);
  if (!carrier || carrier.team !== state.turn) return state;
  if (state.ball.carrierId !== carrier.id) return state;

  const receiver = state.pieces.find(
    (p) => p.x === action.to.x && p.y === action.to.y && p.team === carrier.team,
  );
  if (!receiver || !isReceiver(carrier, receiver, carrier.passRange)) {
    return state;
  }

  // TODO(FUTUR): passInterception hook before delivery.
  const ball = { x: receiver.x, y: receiver.y, carrierId: receiver.id };
  return endTurn({ ...state, ball });
};
