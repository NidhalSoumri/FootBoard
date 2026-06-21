// GOALKEEPER_SAVE [NOW] — the keeper of the defending team picks a save point.
// Saved if the guess is within goalInterceptPower of the shot's aim; otherwise
// the goal stands and play restarts at kickoff.
import { resetKickoff, endTurn } from "../turn";
import type { ActionHandler, GoalkeeperSaveAction, Team } from "../types";

const other = (t: Team): Team => (t === "HOME" ? "AWAY" : "HOME");

export const goalkeeperSaveHandler: ActionHandler<GoalkeeperSaveAction> = (
  state,
  action,
) => {
  if (state.phase !== "GOALKEEPER" || !state.pendingShot) return state;

  const shot = state.pendingShot;
  const defending = other(shot.team);
  const gk = state.pieces.find((p) => p.id === action.goalkeeperId);
  if (!gk || gk.team !== defending || gk.role !== "GK") return state;

  const saved =
    Math.abs(action.savePoint.y - shot.target.y) <= gk.goalInterceptPower;

  if (saved) {
    // Keeper collects the ball; possession (and the turn) go to his team.
    const ball = { x: gk.x, y: gk.y, carrierId: gk.id };
    return endTurn({ ...state, ball, phase: "PLAY", pendingShot: null });
  }

  // Goal: increment score and restart from kickoff for the conceding team.
  const score = {
    ...state.score,
    [shot.team]: state.score[shot.team] + 1,
  };
  const afterGoal = resetKickoff(
    { ...state, score, pendingShot: null, phase: "PLAY" },
    defending,
  );
  return endTurn(afterGoal);
};
