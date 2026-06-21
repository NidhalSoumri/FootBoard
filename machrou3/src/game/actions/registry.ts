// ============================================================================
// Action REGISTRY — the single extension point of the engine.
// Adding a future action = add its handler here. The engine never grows a
// switch statement; it only looks actions up by key.
// ============================================================================

import type { ActionRegistry } from "../types";
import { moveHandler } from "./move";
import { passHandler } from "./pass";
import { shotHandler } from "./shot";
import { crossHandler } from "./cross";
import { dribbleHandler } from "./dribble";
import { antiDribbleHandler } from "./antiDribble";
import { goalkeeperSaveHandler } from "./goalkeeperSave";
import { passInterceptionHandler } from "./passInterception";

export const actionRegistry: ActionRegistry = {
  MOVE: moveHandler,
  PASS: passHandler,
  SHOT: shotHandler,
  CROSS: crossHandler,
  DRIBBLE: dribbleHandler,
  ANTI_DRIBBLE: antiDribbleHandler,
  GOALKEEPER_SAVE: goalkeeperSaveHandler,
  PASS_INTERCEPTION: passInterceptionHandler, // [FUTUR]
};
