// ============================================================================
// Victory conditions — end of match by time elapsed OR goal target reached.
// Step 1: shape only. Full evaluation + tests land in step 2.
// ============================================================================

import { totalTurns } from "./rules";
import type { GameState, Team } from "./types";

/** Has the match run out of turns? */
export function isTimeUp(state: GameState): boolean {
  return state.turnNumber >= totalTurns(state.config);
}

/**
 * Determine the winner, or null if the game continues.
 * Returns "DRAW" when time is up and scores are level (and no goal target).
 */
export function evaluateVictory(state: GameState): Team | "DRAW" | null {
  const { goalsToWin } = state.config;

  if (goalsToWin != null) {
    if (state.score.HOME >= goalsToWin) return "HOME";
    if (state.score.AWAY >= goalsToWin) return "AWAY";
  }

  if (isTimeUp(state)) {
    if (state.score.HOME > state.score.AWAY) return "HOME";
    if (state.score.AWAY > state.score.HOME) return "AWAY";
    return "DRAW";
  }

  return null;
}
