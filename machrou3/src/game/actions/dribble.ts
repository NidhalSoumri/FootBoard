// DRIBBLE [NOW] — two roles:
//  • initiation (no path): the carrier moves onto an opposing piece's tile and
//    a duel begins (phase => DUEL). No turn is consumed yet.
//  • resolution (with path): the carrier traces an edge-to-edge path; if it
//    crosses a blocked cell the ball is intercepted, otherwise the dribble wins.
import { createDuel, resolveDuel } from "../duel";
import { isMoveMatrix, teammateInPath } from "../movement";
import { attackDir } from "../rules";
import type { ActionHandler, DribbleAction } from "../types";

export const dribbleHandler: ActionHandler<DribbleAction> = (state, action) => {
  // ---- resolution ----
  if (state.phase === "DUEL") {
    if (!action.path) return state;
    return resolveDuel(state, action.path);
  }

  // ---- initiation ----
  if (state.phase !== "PLAY") return state;

  const carrier = state.pieces.find((p) => p.id === action.pieceId);
  if (!carrier || carrier.team !== state.turn) return state;
  if (state.ball.carrierId !== carrier.id) return state;

  const defender = state.pieces.find((p) => p.id === action.defenderId);
  if (!defender || defender.team === carrier.team) return state;

  // The defender must sit on a tile the carrier could legally move onto
  // (matrix reach + no teammate blocking the path).
  const dir = attackDir(carrier.team, state.half);
  if (!isMoveMatrix(defender.x, defender.y, carrier, dir)) return state;
  if (teammateInPath(state.pieces, carrier, defender.x, defender.y)) {
    return state;
  }

  return { ...state, phase: "DUEL", duel: createDuel(carrier, defender) };
};
