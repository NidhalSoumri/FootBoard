// ============================================================================
// Builds the starting pieces from the data-driven formations + role templates
// in rules.ts. No balancing numbers live here — only assembly.
// ============================================================================

import {
  AWAY_FORMATION,
  HOME_FORMATION,
  ROLE_STATS,
  type SpawnSpec,
} from "./rules";
import type { Piece, Team } from "./types";

function buildTeam(team: Team, formation: SpawnSpec[]): Piece[] {
  const prefix = team === "HOME" ? "H" : "A";
  return formation.map(({ role, x, y }) => {
    const stats = ROLE_STATS[role];
    return {
      id: `${prefix}_${role}`,
      team,
      role,
      x,
      y,
      ...stats,
      // clone matrix so pieces never share a mutable reference
      movement: [...stats.movement],
    };
  });
}

/** Fresh, independent set of starting pieces (safe to mutate downstream). */
export function createPieces(): Piece[] {
  return [
    ...buildTeam("HOME", HOME_FORMATION),
    ...buildTeam("AWAY", AWAY_FORMATION),
  ];
}

/** Convenience default roster (kept for existing imports). */
export const pieces: Piece[] = createPieces();
