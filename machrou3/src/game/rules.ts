// ============================================================================
// FootBoard — data-driven CONFIG. SINGLE source of truth for every balancing
// number, board dimension and time setting. No magic numbers may live anywhere
// else in src/game or the UI. Tweak the game here.
// ============================================================================

import type { GameConfig, MovementMatrix, Role, Team } from "./types";

// ----------------------------------------------------------------------------
// Board
// ----------------------------------------------------------------------------
export const GRID = {
  width: 29, // along the length of the pitch (x)
  height: 17, // across the width of the pitch (y)
} as const;

/** Goal mouth spans these y rows on each end line. */
export const GOAL = {
  yMin: 6,
  yMax: 10,
  homeLineX: 0, // HOME defends x=0, attacks toward x=width-1
  awayLineX: GRID.width - 1,
} as const;

// ----------------------------------------------------------------------------
// Time / turns / victory
// ----------------------------------------------------------------------------
export const TIME = {
  minutes: 90,
  turnsPerMinute: 2,
  halfTimeEnabled: true,
} as const;

export const VICTORY = {
  /** first to N goals; null => decided purely by time. */
  goalsToWin: null as number | null,
} as const;

export const SQUAD = { perTeam: 11 } as const;

export const TEAM_COLORS: Record<Team, string> = {
  HOME: "#2f6fed",
  AWAY: "#e23b3b",
};

// ----------------------------------------------------------------------------
// Movement matrices (team-relative, odd square). "1" = legal landing cell.
// ----------------------------------------------------------------------------

/** Chess-king style 1-cell reach, expressed on a 13x13 grid for headroom. */
export const KING_MATRIX: MovementMatrix = [
  "0000000000000",
  "0000000000000",
  "0000000000000",
  "0000000000000",
  "0000000000000",
  "0000011100000",
  "0000010100000",
  "0000011100000",
  "0000000000000",
  "0000000000000",
  "0000000000000",
  "0000000000000",
  "0000000000000",
];

// ----------------------------------------------------------------------------
// Per-role stat templates. Each piece is built from its role template (see
// formation.ts), so balancing stays centralized here.
// ----------------------------------------------------------------------------
export interface StatTemplate {
  movement: MovementMatrix;
  passRange: number; // signed: + square / - circular
  shotRange: number;
  crossRange: number;
  dribblePower: number;
  defensePower: number;
  interceptSlots: number;
  goalInterceptPower: number;
  // [FUTUR] hooks — optional, no logic consumes them yet.
  crossInterceptRange?: number;
  passInterceptRange?: number;
}

const OUTFIELD_BASE: StatTemplate = {
  movement: KING_MATRIX,
  passRange: 4, // + => square reach
  shotRange: 5,
  crossRange: 6,
  dribblePower: 4,
  defensePower: 0,
  interceptSlots: 2,
  goalInterceptPower: 0,
};

export const ROLE_STATS: Record<Role, StatTemplate> = {
  GK: {
    ...OUTFIELD_BASE,
    shotRange: 5,
    dribblePower: 4,
    interceptSlots: 2,
    // save tolerance (cells around the guessed point); kept low so aiming matters
    goalInterceptPower: 1,
  },
  LB: { ...OUTFIELD_BASE },
  LCB: { ...OUTFIELD_BASE },
  RCB: { ...OUTFIELD_BASE },
  RB: { ...OUTFIELD_BASE },
  LM: { ...OUTFIELD_BASE },
  LCM: { ...OUTFIELD_BASE },
  RCM: { ...OUTFIELD_BASE },
  RM: { ...OUTFIELD_BASE },
  LS: { ...OUTFIELD_BASE },
  RS: { ...OUTFIELD_BASE },
};

// ----------------------------------------------------------------------------
// Formations: starting (role,x,y) per team. HOME defends the left (x=0).
// ----------------------------------------------------------------------------
export interface SpawnSpec {
  role: Role;
  x: number;
  y: number;
}

export const HOME_FORMATION: SpawnSpec[] = [
  { role: "GK", x: 1, y: 8 },
  { role: "LB", x: 5, y: 1 },
  { role: "LCB", x: 4, y: 5 },
  { role: "RCB", x: 4, y: 11 },
  { role: "RB", x: 5, y: 15 },
  { role: "LM", x: 9, y: 1 },
  { role: "LCM", x: 8, y: 5 },
  { role: "RCM", x: 8, y: 11 },
  { role: "RM", x: 9, y: 15 },
  { role: "LS", x: 12, y: 5 },
  { role: "RS", x: 12, y: 11 },
];

export const AWAY_FORMATION: SpawnSpec[] = [
  { role: "GK", x: 27, y: 8 },
  { role: "RB", x: 23, y: 1 },
  { role: "RCB", x: 24, y: 5 },
  { role: "LCB", x: 24, y: 11 },
  { role: "LB", x: 23, y: 15 },
  { role: "RM", x: 19, y: 1 },
  { role: "RCM", x: 20, y: 5 },
  { role: "LCM", x: 20, y: 11 },
  { role: "LM", x: 19, y: 15 },
  { role: "RS", x: 16, y: 5 },
  { role: "LS", x: 16, y: 11 },
];

/** Which team starts with the ball, and which piece carries it. */
export const KICKOFF = {
  team: "HOME" as Team,
  carrierRole: "LCM" as Role,
};

// ----------------------------------------------------------------------------
// Aggregate CONFIG + default GameConfig derived from it (used by the Landing
// defaults and as a fallback when starting a game without explicit settings).
// ----------------------------------------------------------------------------
export const CONFIG = {
  grid: GRID,
  goal: GOAL,
  time: TIME,
  victory: VICTORY,
  squad: SQUAD,
  colors: TEAM_COLORS,
  stats: ROLE_STATS,
  formations: { HOME: HOME_FORMATION, AWAY: AWAY_FORMATION },
  kickoff: KICKOFF,
} as const;

export const DEFAULT_CONFIG: GameConfig = {
  minutes: TIME.minutes,
  turnsPerMinute: TIME.turnsPerMinute,
  halfTimeEnabled: TIME.halfTimeEnabled,
  goalsToWin: VICTORY.goalsToWin,
  homeColor: TEAM_COLORS.HOME,
  awayColor: TEAM_COLORS.AWAY,
  localTwoPlayer: true,
};

/** Total turns in a match, derived from config. */
export function totalTurns(config: GameConfig): number {
  return Math.round(config.minutes * config.turnsPerMinute);
}

/** Turn index at which half-time occurs (midpoint => start of 2nd half). */
export function halfTimeTurn(config: GameConfig): number {
  return Math.round(totalTurns(config) / 2);
}

/**
 * Attack direction along x for a team in a given half. HOME attacks +x in the
 * first half; sides swap at half-time. Used to orient movement matrices and to
 * find which goal a team is shooting at.
 */
export function attackDir(team: Team, half: 1 | 2): 1 | -1 {
  const base = team === "HOME" ? 1 : -1;
  return (half === 1 ? base : -base) as 1 | -1;
}

/** x of the goal line a team is attacking, accounting for half-time swap. */
export function attackingGoalX(team: Team, half: 1 | 2): number {
  return attackDir(team, half) === 1 ? GOAL.awayLineX : GOAL.homeLineX;
}
