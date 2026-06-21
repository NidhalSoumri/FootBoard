// ============================================================================
// Targeting — pure range/eligibility helpers shared by action handlers and the
// UI (so highlights and validation never drift apart). No magic numbers: ranges
// come from the piece (sourced from rules.ts).
// ============================================================================

import { isMoveMatrix, teammateInPath } from "./movement";
import { attackingGoalX, GOAL } from "./rules";
import type { Piece, Team, Tile } from "./types";

/**
 * Signed-range test. The carrier's pass/cross range is SIGNED:
 *   >= 0 => square (Chebyshev) reach
 *   <  0 => circular (Euclidean) reach
 * The piece's own tile (dx=dy=0) is never a valid target.
 */
export function inSignedRange(dx: number, dy: number, range: number): boolean {
  if (dx === 0 && dy === 0) return false;
  if (range >= 0) return Math.max(Math.abs(dx), Math.abs(dy)) <= range;
  return Math.hypot(dx, dy) <= -range;
}

/** Is `target` a legal pass/cross receiver for `carrier` at the given range? */
export function isReceiver(
  carrier: Piece,
  target: Piece,
  range: number,
): boolean {
  if (target.id === carrier.id || target.team !== carrier.team) return false;
  return inSignedRange(target.x - carrier.x, target.y - carrier.y, range);
}

export function passTargets(pieces: Piece[], carrier: Piece): Piece[] {
  return pieces.filter((p) => isReceiver(carrier, p, carrier.passRange));
}

export function crossTargets(pieces: Piece[], carrier: Piece): Piece[] {
  return pieces.filter((p) => isReceiver(carrier, p, carrier.crossRange));
}

/** Chebyshev distance from a piece to the mouth of the goal it attacks. */
export function distanceToGoal(piece: Piece, half: 1 | 2): number {
  const goalX = attackingGoalX(piece.team, half);
  const dx = Math.abs(piece.x - goalX);
  const dy =
    piece.y < GOAL.yMin
      ? GOAL.yMin - piece.y
      : piece.y > GOAL.yMax
        ? piece.y - GOAL.yMax
        : 0;
  return Math.max(dx, dy);
}

/** Can this piece shoot — i.e. is the goal within its shotRange? */
export function canShoot(piece: Piece, half: 1 | 2): boolean {
  return distanceToGoal(piece, half) <= piece.shotRange;
}

/** The tile a shot aims at: the center of the attacked goal mouth. */
export function shotTarget(team: Team, half: 1 | 2): Tile {
  return {
    x: attackingGoalX(team, half),
    y: Math.round((GOAL.yMin + GOAL.yMax) / 2),
  };
}

/** Can the carrier dribble onto this opponent's tile (reachable + unblocked)? */
export function canDribbleOnto(
  pieces: Piece[],
  carrier: Piece,
  defender: Piece,
  dir: 1 | -1,
): boolean {
  if (defender.team === carrier.team) return false;
  if (!isMoveMatrix(defender.x, defender.y, carrier, dir)) return false;
  return !teammateInPath(pieces, carrier, defender.x, defender.y);
}

/** Opposing pieces the carrier may start a duel against. */
export function dribbleTargets(
  pieces: Piece[],
  carrier: Piece,
  dir: 1 | -1,
): Piece[] {
  return pieces.filter((p) => canDribbleOnto(pieces, carrier, p, dir));
}
