import { describe, it, expect } from "vitest";
import { createInitialState } from "../engine";
import { evaluateVictory, isTimeUp } from "../victory";
import { DEFAULT_CONFIG, totalTurns } from "../rules";

describe("victory", () => {
  it("no winner at kickoff", () => {
    expect(evaluateVictory(createInitialState())).toBeNull();
  });

  it("goal target wins immediately regardless of time", () => {
    const s = createInitialState({ ...DEFAULT_CONFIG, goalsToWin: 3 });
    expect(evaluateVictory({ ...s, score: { HOME: 3, AWAY: 1 } })).toBe("HOME");
    expect(evaluateVictory({ ...s, score: { HOME: 1, AWAY: 3 } })).toBe("AWAY");
    expect(evaluateVictory({ ...s, score: { HOME: 2, AWAY: 2 } })).toBeNull();
  });

  it("decides by score when time is up", () => {
    const s = createInitialState({ ...DEFAULT_CONFIG, goalsToWin: null });
    const ended = { ...s, turnNumber: totalTurns(s.config) };
    expect(isTimeUp(ended)).toBe(true);
    expect(evaluateVictory({ ...ended, score: { HOME: 2, AWAY: 0 } })).toBe(
      "HOME",
    );
    expect(evaluateVictory({ ...ended, score: { HOME: 0, AWAY: 0 } })).toBe(
      "DRAW",
    );
  });
});
