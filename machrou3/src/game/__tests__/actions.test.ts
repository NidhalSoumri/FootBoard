import { describe, it, expect } from "vitest";
import { applyAction, createInitialState } from "../engine";
import { shotTarget, inSignedRange } from "../targeting";
import type { GameState } from "../types";

describe("PASS", () => {
  it("delivers to a teammate in range and flips the turn", () => {
    const s0 = createInitialState();
    expect(s0.ball.carrierId).toBe("H_LCM"); // kickoff carrier

    // H_LCM (8,5) -> H_LCB (4,5): Chebyshev 4 <= passRange 4
    const s1 = applyAction(s0, {
      type: "PASS",
      pieceId: "H_LCM",
      to: { x: 4, y: 5 },
    });
    expect(s1.ball.carrierId).toBe("H_LCB");
    expect(s1.ball).toMatchObject({ x: 4, y: 5 });
    expect(s1.turn).toBe("AWAY");
    expect(s1.turnNumber).toBe(1);
  });

  it("rejects out-of-range, non-carrier, and non-teammate targets", () => {
    const s0 = createInitialState();
    // out of range (H_GK at 1,8 is 7 away)
    expect(
      applyAction(s0, { type: "PASS", pieceId: "H_LCM", to: { x: 1, y: 8 } }),
    ).toBe(s0);
    // not the carrier
    expect(
      applyAction(s0, { type: "PASS", pieceId: "H_LB", to: { x: 4, y: 5 } }),
    ).toBe(s0);
    // empty tile (no receiver)
    expect(
      applyAction(s0, { type: "PASS", pieceId: "H_LCM", to: { x: 9, y: 6 } }),
    ).toBe(s0);
  });
});

describe("CROSS", () => {
  it("reaches a teammate within crossRange that a pass cannot", () => {
    const s0 = createInitialState();
    // H_LCM (8,5) -> H_RS (12,11): Chebyshev 6 == crossRange 6, > passRange 4
    const crossed = applyAction(s0, {
      type: "CROSS",
      pieceId: "H_LCM",
      to: { x: 12, y: 11 },
    });
    expect(crossed.ball.carrierId).toBe("H_RS");

    // the same target is illegal for a pass
    expect(
      applyAction(s0, { type: "PASS", pieceId: "H_LCM", to: { x: 12, y: 11 } }),
    ).toBe(s0);
  });
});

describe("SHOT", () => {
  function carrierNearGoal(): GameState {
    const s = createInitialState();
    const pieces = s.pieces.map((p) =>
      p.id === "H_LCM" ? { ...p, x: 24, y: 8 } : p,
    );
    return { ...s, pieces, ball: { x: 24, y: 8, carrierId: "H_LCM" } };
  }

  it("a valid shot enters the GOALKEEPER phase (no goal yet)", () => {
    const s0 = carrierNearGoal();
    const s1 = applyAction(s0, {
      type: "SHOT",
      pieceId: "H_LCM",
      to: shotTarget("HOME", 1),
    });
    expect(s1.phase).toBe("GOALKEEPER");
    expect(s1.pendingShot?.shooterId).toBe("H_LCM");
    expect(s1.score.HOME).toBe(0); // not scored yet
    expect(s1.turn).toBe("HOME"); // turn not consumed yet
  });

  it("is blocked when the goal is out of range", () => {
    const s0 = createInitialState(); // H_LCM far from goal
    expect(
      applyAction(s0, {
        type: "SHOT",
        pieceId: "H_LCM",
        to: shotTarget("HOME", 1),
      }),
    ).toBe(s0);
  });
});

describe("signed range", () => {
  it("positive = square, negative = circular", () => {
    expect(inSignedRange(2, 2, 2)).toBe(true); // square corner reachable
    expect(inSignedRange(2, 2, -2)).toBe(false); // circular: dist ~2.83 > 2
    expect(inSignedRange(2, 0, -2)).toBe(true); // circular along axis
    expect(inSignedRange(0, 0, 5)).toBe(false); // own tile never a target
  });
});
