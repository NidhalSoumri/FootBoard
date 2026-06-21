// SHOT [NOW] — attempt on goal; blocked if the goal is outside shotRange.
// A valid shot enters the GOALKEEPER phase so the keeper can attempt a save
// before the goal is awarded (resolved in goalkeeperSave.ts).
import { canShoot } from "../targeting";
import type { ActionHandler, ShotAction } from "../types";

export const shotHandler: ActionHandler<ShotAction> = (state, action) => {
  if (state.phase !== "PLAY") return state;

  const shooter = state.pieces.find((p) => p.id === action.pieceId);
  if (!shooter || shooter.team !== state.turn) return state;
  if (state.ball.carrierId !== shooter.id) return state;

  // Blocked if the goal is out of range.
  if (!canShoot(shooter, state.half)) return state;

  return {
    ...state,
    phase: "GOALKEEPER",
    pendingShot: {
      team: shooter.team,
      shooterId: shooter.id,
      target: action.to,
    },
  };
};
