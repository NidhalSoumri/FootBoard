import { describe, it, expect } from "vitest";
import { applyAction, createInitialState } from "../engine";
import { attackingGoalX } from "../rules";
import type { GameState } from "../types";

/** HOME carrier near the AWAY goal, having just shot at goal-mouth row `aimY`. */
function shotPending(aimY: number): GameState {
  const s = createInitialState();
  const pieces = s.pieces.map((p) =>
    p.id === "H_LCM" ? { ...p, x: 24, y: 8 } : p,
  );
  const base: GameState = { ...s, pieces, ball: { x: 24, y: 8, carrierId: "H_LCM" } };
  const goalX = attackingGoalX("HOME", 1);
  return applyAction(base, {
    type: "SHOT",
    pieceId: "H_LCM",
    to: { x: goalX, y: aimY },
  });
}

describe("goalkeeper save", () => {
  it("saves when the guess is within goalInterceptPower", () => {
    const s = shotPending(8);
    const r = applyAction(s, {
      type: "GOALKEEPER_SAVE",
      goalkeeperId: "A_GK",
      savePoint: { x: attackingGoalX("HOME", 1), y: 8 },
    });
    expect(r.phase).toBe("PLAY");
    expect(r.score.HOME).toBe(0);
    expect(r.ball.carrierId).toBe("A_GK"); // keeper collects
    expect(r.turn).toBe("AWAY");
  });

  it("concedes a goal when the guess is too far off", () => {
    const s = shotPending(8);
    const r = applyAction(s, {
      type: "GOALKEEPER_SAVE",
      goalkeeperId: "A_GK",
      savePoint: { x: attackingGoalX("HOME", 1), y: 6 }, // |6-8| = 2 > 1
    });
    expect(r.phase).toBe("PLAY");
    expect(r.score.HOME).toBe(1);
    expect(r.ball.carrierId).toBe("A_LCM"); // conceding team kicks off
    expect(r.turn).toBe("AWAY");
  });

  it("ignores a save from the wrong keeper", () => {
    const s = shotPending(8);
    expect(
      applyAction(s, {
        type: "GOALKEEPER_SAVE",
        goalkeeperId: "H_GK", // attacking side's keeper
        savePoint: { x: attackingGoalX("HOME", 1), y: 8 },
      }),
    ).toBe(s);
  });
});
