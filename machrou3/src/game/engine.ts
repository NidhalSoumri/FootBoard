// ============================================================================
// Engine — immutable state transitions driven by the action REGISTRY.
// No game-specific switch lives here: applyAction looks the handler up by key,
// so new actions plug in without editing the engine.
// ============================================================================

import { actionRegistry } from "./actions/registry";
import { createPieces } from "./formation";
import { DEFAULT_CONFIG, GOAL, KICKOFF } from "./rules";
import type { Action, GameConfig, GameState } from "./types";

/** Builds a fresh game state from a config (defaults to CONFIG defaults). */
export function createInitialState(
  config: GameConfig = DEFAULT_CONFIG,
): GameState {
  const pieces = createPieces();
  const carrier = pieces.find(
    (p) => p.team === KICKOFF.team && p.role === KICKOFF.carrierRole,
  );

  return {
    config,
    pieces,
    ball: {
      x: carrier ? carrier.x : Math.round(GOAL.awayLineX / 2),
      y: carrier ? carrier.y : GOAL.yMin,
      carrierId: carrier ? carrier.id : null,
    },
    turn: KICKOFF.team,
    turnNumber: 0,
    half: 1,
    score: { HOME: 0, AWAY: 0 },
    phase: "PLAY",
    duel: null,
    pendingShot: null,
    winner: null,
  };
}

/**
 * Apply an action immutably via the registry. Unknown / unregistered actions
 * return the state unchanged (defensive — keeps the engine total).
 */
export function applyAction(state: GameState, action: Action): GameState {
  const handler = actionRegistry[action.type];
  if (!handler) return state;
  // The registry maps each key to a handler of the matching action variant.
  return (handler as (s: GameState, a: Action) => GameState)(state, action);
}

/** Default initial state, kept for convenience / existing imports. */
export const initialGameState: GameState = createInitialState();
