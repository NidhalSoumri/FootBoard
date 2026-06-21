// ============================================================================
// Duel phase — triggered when the carrier moves onto an opposing piece's tile.
// The sub-grid size scales with (dribblePower - defensePower); the defender
// colors interceptSlots cells; the carrier traces a continuous edge-to-edge
// path. Crossing a colored cell => ball intercepted (carrier moves on without
// the ball); otherwise the dribble succeeds and the carrier keeps the ball.
// ============================================================================

import { endTurn } from "./turn";
import type { DuelState, GameState, Piece, Tile } from "./types";

/** Bounds for the sub-grid so it stays playable. */
export const DUEL_MIN_SIZE = 3;
export const DUEL_MAX_SIZE = 9;

/** Sub-grid size as a function of the dribble/defense gap (odd-friendly). */
export function duelSize(carrier: Piece, defender: Piece): number {
  const gap = carrier.dribblePower - defender.defensePower;
  return Math.min(DUEL_MAX_SIZE, Math.max(DUEL_MIN_SIZE, DUEL_MIN_SIZE + gap));
}

/** Create a fresh, unresolved duel between a carrier and a defender. */
export function createDuel(carrier: Piece, defender: Piece): DuelState {
  return {
    carrierId: carrier.id,
    defenderId: defender.id,
    size: duelSize(carrier, defender),
    blockedCells: [],
    defenderReady: false,
    path: [],
    resolved: false,
    intercepted: false,
  };
}

/** Does the carrier's path step onto any of the defender's blocked cells? */
export function pathCrossesBlock(path: Tile[], blocked: Tile[]): boolean {
  return path.some((t) => blocked.some((b) => b.x === t.x && b.y === t.y));
}

/**
 * A valid carrier path is continuous (4-adjacent steps, no repeats), enters on
 * the left column (x=0) and exits on the right column (x=size-1).
 */
export function isValidDuelPath(path: Tile[], size: number): boolean {
  if (path.length < size) return false; // must at least span the grid width
  if (path[0].x !== 0) return false;
  if (path[path.length - 1].x !== size - 1) return false;

  const seen = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const t = path[i];
    if (t.x < 0 || t.x >= size || t.y < 0 || t.y >= size) return false;
    const key = `${t.x},${t.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (i > 0) {
      const prev = path[i - 1];
      const manhattan = Math.abs(t.x - prev.x) + Math.abs(t.y - prev.y);
      if (manhattan !== 1) return false;
    }
  }
  return true;
}

/**
 * Resolve a duel: move the carrier onto the contested tile, assign the ball to
 * the winner, clear the duel, and end the turn.
 */
export function resolveDuel(state: GameState, path: Tile[]): GameState {
  const duel = state.duel;
  if (!duel) return state;

  const carrier = state.pieces.find((p) => p.id === duel.carrierId);
  const defender = state.pieces.find((p) => p.id === duel.defenderId);
  if (!carrier || !defender) {
    return endTurn({ ...state, phase: "PLAY", duel: null });
  }

  const intercepted = pathCrossesBlock(path, duel.blockedCells);

  // The carrier physically advances onto the contested tile either way.
  const pieces = state.pieces.map((p) =>
    p.id === carrier.id ? { ...p, x: defender.x, y: defender.y } : p,
  );

  const ball = intercepted
    ? { x: defender.x, y: defender.y, carrierId: defender.id } // lost to defender
    : { x: defender.x, y: defender.y, carrierId: carrier.id }; // kept

  return endTurn({ ...state, pieces, ball, phase: "PLAY", duel: null });
}
