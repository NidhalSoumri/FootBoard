// ============================================================================
// Zustand store — a thin React-facing wrapper around the pure engine.
// All game mutation flows through engine.applyAction; the store only holds the
// current immutable GameState + light UI state (selection, action mode).
// No game rules live here.
// ============================================================================

import { create } from "zustand";
import { applyAction, createInitialState } from "../game/engine";
import { resumeFromHalfTime } from "../game/turn";
import { DEFAULT_CONFIG } from "../game/rules";
import type { Action, GameConfig, GameState } from "../game/types";

/** Which kind of target the player is currently choosing for the selection. */
export type ActionMode = "MOVE" | "PASS" | "CROSS" | "DRIBBLE" | "SHOOT";

interface GameStore {
  state: GameState;
  selectedPieceId: string | null;
  actionMode: ActionMode;

  dispatch: (action: Action) => void;
  newGame: (config?: GameConfig) => void;
  select: (pieceId: string | null) => void;
  setActionMode: (mode: ActionMode) => void;
  resume: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialState(DEFAULT_CONFIG),
  selectedPieceId: null,
  actionMode: "MOVE",

  dispatch: (action) =>
    set((store) => ({
      state: applyAction(store.state, action),
      // any successful action clears the current selection/target mode
      selectedPieceId: null,
      actionMode: "MOVE",
    })),

  newGame: (config = DEFAULT_CONFIG) =>
    set({
      state: createInitialState(config),
      selectedPieceId: null,
      actionMode: "MOVE",
    }),

  // selecting a piece always starts in MOVE mode
  select: (pieceId) => set({ selectedPieceId: pieceId, actionMode: "MOVE" }),

  setActionMode: (mode) => set({ actionMode: mode }),

  resume: () =>
    set((store) => ({ state: resumeFromHalfTime(store.state) })),
}));
