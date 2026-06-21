// ANTI_DRIBBLE [NOW] — defender's side of a duel: commit up to interceptSlots
// blocked cells in the sub-grid. If the carrier's path later crosses one, the
// ball is intercepted.
import type { ActionHandler, AntiDribbleAction } from "../types";

export const antiDribbleHandler: ActionHandler<AntiDribbleAction> = (
  state,
  action,
) => {
  if (state.phase !== "DUEL" || !state.duel) return state;
  if (state.duel.defenderId !== action.defenderId) return state;

  const defender = state.pieces.find((p) => p.id === action.defenderId);
  if (!defender) return state;

  // Cap to the defender's interceptSlots; keep only in-grid cells.
  const size = state.duel.size;
  const blockedCells = action.blockedCells
    .filter((c) => c.x >= 0 && c.x < size && c.y >= 0 && c.y < size)
    .slice(0, defender.interceptSlots);

  return {
    ...state,
    duel: { ...state.duel, blockedCells, defenderReady: true },
  };
};
