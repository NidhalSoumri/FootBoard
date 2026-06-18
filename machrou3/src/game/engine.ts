import { players } from "./formation";
import type { GameState } from "./types";

export const initialGameState: GameState = {
  players,

  ball: {
    x:20,
    y:11,
    carrierId: "A_LCM",
  },

  turn: "HOME",
};