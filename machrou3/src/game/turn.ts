// ============================================================================
// Turn / clock management — pure helpers used by turn-consuming action handlers.
// Advances the turn counter, performs the half-time side swap at 45', and ends
// the match when time is up or the goal target is reached.
// ============================================================================

import { createPieces } from "./formation";
import { GRID, halfTimeTurn, KICKOFF, totalTurns } from "./rules";
import { evaluateVictory } from "./victory";
import type { GameState, Team } from "./types";

const other = (team: Team): Team => (team === "HOME" ? "AWAY" : "HOME");
const mirrorX = (x: number): number => GRID.width - 1 - x;

/**
 * Rebuild the starting formation (oriented for the current half) and hand the
 * ball to `receivingTeam`'s kickoff carrier. Score/turn/clock are preserved so
 * the caller can advance the turn afterwards.
 */
export function resetKickoff(
  state: GameState,
  receivingTeam: Team,
): GameState {
  const base = createPieces();
  const pieces =
    state.half === 2 ? base.map((p) => ({ ...p, x: mirrorX(p.x) })) : base;
  const carrier =
    pieces.find(
      (p) => p.team === receivingTeam && p.role === KICKOFF.carrierRole,
    ) ?? pieces.find((p) => p.team === receivingTeam)!;

  return {
    ...state,
    pieces,
    ball: { x: carrier.x, y: carrier.y, carrierId: carrier.id },
  };
}

/** Mirror all pieces + the ball across the half-way line (swap ends). */
export function swapSides(state: GameState): GameState {
  return {
    ...state,
    pieces: state.pieces.map((p) => ({ ...p, x: mirrorX(p.x) })),
    ball: { ...state.ball, x: mirrorX(state.ball.x) },
  };
}

/**
 * End the current turn. Increments the counter, hands the turn to the opponent,
 * applies the half-time swap once, and sets FULLTIME when the match is decided.
 */
export function endTurn(state: GameState): GameState {
  let next: GameState = {
    ...state,
    turnNumber: state.turnNumber + 1,
    turn: other(state.turn),
  };

  // Half-time: stop the game, swap ends, and restart from the center kickoff.
  if (
    next.config.halfTimeEnabled &&
    next.half === 1 &&
    next.turnNumber >= halfTimeTurn(next.config) &&
    next.turnNumber < totalTurns(next.config)
  ) {
    // The team that did not kick off the match starts the second half.
    next = resetKickoff({ ...next, half: 2 }, "AWAY");
    next = { ...next, turn: "AWAY", phase: "HALFTIME" };
  }

  // Match decided? (goal target reached OR time elapsed) — overrides half-time.
  const winner = evaluateVictory(next);
  if (winner !== null) {
    next = { ...next, phase: "FULLTIME", winner };
  }

  return next;
}

/** Leave the half-time pause and resume play. */
export function resumeFromHalfTime(state: GameState): GameState {
  return state.phase === "HALFTIME" ? { ...state, phase: "PLAY" } : state;
}
