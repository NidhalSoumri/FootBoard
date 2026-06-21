// PASS_INTERCEPTION [FUTUR] — empty hook. Declared so the registry/types compile
// and the feature can be switched on later WITHOUT touching the engine.
// Intentionally a no-op for now.
import type { ActionHandler, PassInterceptionAction } from "../types";

export const passInterceptionHandler: ActionHandler<PassInterceptionAction> = (
  state,
) => {
  // [FUTUR] no behavior yet.
  return state;
};
