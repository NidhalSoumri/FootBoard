// ============================================================================
// FootBoard — core domain types.
// Pure data only: NO React imports here. Everything balancing/temporal lives in
// rules.ts (CONFIG). Fields tagged [FUTUR] are extension hooks — declared now so
// nothing breaks when the matching feature is switched on, but carry no logic.
// ============================================================================

export type Team = "HOME" | "AWAY";

export type Role =
  | "GK"
  | "LB"
  | "LCB"
  | "RCB"
  | "RB"
  | "LM"
  | "LCM"
  | "RCM"
  | "RM"
  | "LS"
  | "RS";

/**
 * Team-relative odd-sized square matrix of "0"/"1" strings.
 * The center cell is the piece; "1" marks a legal landing cell.
 * Orientation is resolved per-team in movement.ts (HOME attacks +x, AWAY -x).
 */
export type MovementMatrix = string[];

/** A single board square. */
export interface Tile {
  x: number;
  y: number;
}

/**
 * A piece on the pitch. Per-piece balancing comes from rules.ts templates;
 * the values are copied onto the piece so the engine never reaches back into
 * config at runtime (pure, serializable state).
 *
 * `passRange` is SIGNED by design:
 *   > 0  => square (Chebyshev) reach
 *   < 0  => circular (Euclidean) reach
 */
export interface Piece {
  id: string;
  team: Team;
  role: Role;

  x: number;
  y: number;

  movement: MovementMatrix;
  passRange: number; // signed: + square / - circular
  shotRange: number;
  crossRange: number; // [NOW] cross action reach
  dribblePower: number;
  defensePower: number;
  interceptSlots: number; // duel: cells the defender may color

  goalInterceptPower: number; // GK save strength (goalkeeperSave action)

  // ---- [FUTUR] extension hooks (no logic yet) ----
  /** [FUTUR] reach at which this piece can intercept a cross. */
  crossInterceptRange?: number;
  /** [FUTUR] reach at which this piece can intercept a pass. */
  passInterceptRange?: number;
}

export interface Ball {
  x: number;
  y: number;
  carrierId: string | null;
}

/** Coarse game phase — drives which UI overlay is active. */
export type GamePhase =
  | "PLAY"
  | "DUEL"
  | "GOALKEEPER"
  | "HALFTIME"
  | "FULLTIME";

/**
 * Duel sub-grid state. Spawned when two opposing pieces share a tile.
 * Sub-grid size is a function of (dribblePower - defensePower) — see duel.ts.
 * [NOW]: structure + dribble/anti-dribble. Pathing/interception filled in step 5.
 */
export interface DuelState {
  carrierId: string;
  defenderId: string;
  size: number; // sub-grid dimension
  /** cells the defender has colored (interceptSlots count). sub-grid coords. */
  blockedCells: Tile[];
  /** true once the defender has committed their blocked cells. */
  defenderReady: boolean;
  /** carrier's continuous edge-to-edge path. sub-grid coords. */
  path: Tile[];
  resolved: boolean;
  intercepted: boolean; // true => carrier keeps moving but loses the ball
}

/** User-tunable match configuration coming from the Landing screen. */
export interface GameConfig {
  minutes: number;
  turnsPerMinute: number;
  halfTimeEnabled: boolean;
  /** first to N goals; null => decided purely by time. */
  goalsToWin: number | null;
  homeColor: string;
  awayColor: string;
  localTwoPlayer: boolean;
}

export interface Score {
  HOME: number;
  AWAY: number;
}

/** The full immutable game state threaded through the engine. */
export interface GameState {
  config: GameConfig;
  pieces: Piece[];
  ball: Ball;

  turn: Team;
  turnNumber: number; // 0-based global turn counter
  half: 1 | 2;

  score: Score;
  phase: GamePhase;
  duel: DuelState | null;
  /** A shot awaiting the goalkeeper's save attempt (GOALKEEPER phase). */
  pendingShot: PendingShot | null;
  winner: Team | "DRAW" | null;
}

export interface PendingShot {
  team: Team; // the shooting team
  shooterId: string;
  target: Tile; // aimed point on the goal mouth
}

// ============================================================================
// Action system — discriminated union + extensible registry contract.
// Adding a future action = add a member here + a handler in actions/registry.ts.
// ============================================================================

export type ActionType =
  | "MOVE"
  | "PASS"
  | "SHOT"
  | "CROSS"
  | "DRIBBLE"
  | "ANTI_DRIBBLE"
  | "GOALKEEPER_SAVE"
  | "PASS_INTERCEPTION"; // [FUTUR]

export interface MoveAction {
  type: "MOVE";
  pieceId: string;
  to: Tile;
}

export interface PassAction {
  type: "PASS";
  pieceId: string;
  to: Tile;
}

export interface ShotAction {
  type: "SHOT";
  pieceId: string;
  to: Tile; // target on the goal
}

export interface CrossAction {
  type: "CROSS";
  pieceId: string;
  to: Tile;
}

export interface DribbleAction {
  type: "DRIBBLE";
  pieceId: string;
  defenderId: string;
  /** carrier's edge-to-edge path (sub-grid coords). Present => resolve the duel;
   *  absent => initiate the duel. */
  path?: Tile[];
}

export interface AntiDribbleAction {
  type: "ANTI_DRIBBLE";
  defenderId: string;
  blockedCells: Tile[];
}

export interface GoalkeeperSaveAction {
  type: "GOALKEEPER_SAVE";
  goalkeeperId: string;
  savePoint: Tile;
}

/** [FUTUR] hook — declared so the union/registry compile, no behavior yet. */
export interface PassInterceptionAction {
  type: "PASS_INTERCEPTION";
  pieceId: string;
  at: Tile;
}

export type Action =
  | MoveAction
  | PassAction
  | ShotAction
  | CrossAction
  | DribbleAction
  | AntiDribbleAction
  | GoalkeeperSaveAction
  | PassInterceptionAction;

/** Immutable handler: receives state + action, returns a NEW state. */
export type ActionHandler<A extends Action = Action> = (
  state: GameState,
  action: A,
) => GameState;

export type ActionRegistry = {
  [K in ActionType]?: ActionHandler<Extract<Action, { type: K }>>;
};
