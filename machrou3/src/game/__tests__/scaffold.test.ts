// Step 1 smoke tests — verify the scaffolding holds together: initial state,
// the registry covers every action type, and applyAction is total/immutable
// even though handlers are still stubs.
import { describe, it, expect } from "vitest";
import { applyAction, createInitialState } from "../engine";
import { actionRegistry } from "../actions/registry";
import { evaluateVictory } from "../victory";
import { SQUAD } from "../rules";
import type { ActionType } from "../types";

const ALL_ACTION_TYPES: ActionType[] = [
  "MOVE",
  "PASS",
  "SHOT",
  "CROSS",
  "DRIBBLE",
  "ANTI_DRIBBLE",
  "GOALKEEPER_SAVE",
  "PASS_INTERCEPTION",
];

describe("scaffolding", () => {
  it("builds a full initial state", () => {
    const s = createInitialState();
    expect(s.pieces).toHaveLength(SQUAD.perTeam * 2);
    expect(s.turn).toBe("HOME");
    expect(s.turnNumber).toBe(0);
    expect(s.half).toBe(1);
    expect(s.phase).toBe("PLAY");
    expect(s.winner).toBeNull();
    expect(s.ball.carrierId).not.toBeNull();
  });

  it("registers a handler for every action type", () => {
    for (const type of ALL_ACTION_TYPES) {
      expect(actionRegistry[type]).toBeTypeOf("function");
    }
  });

  it("applyAction is total for not-yet-implemented actions (no-op stubs)", () => {
    const s = createInitialState();
    // PASS is still a stub in step 2 — must return state unchanged, not throw.
    const next = applyAction(s, {
      type: "PASS",
      pieceId: "H_LCM",
      to: { x: 10, y: 5 },
    });
    expect(next).toBe(s);
  });

  it("no winner at kickoff", () => {
    expect(evaluateVictory(createInitialState())).toBeNull();
  });
});
