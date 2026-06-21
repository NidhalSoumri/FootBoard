import { describe, it, expect } from "vitest";
import { applyAction, createInitialState } from "../engine";
import {
  duelSize,
  isValidDuelPath,
  pathCrossesBlock,
} from "../duel";
import type { GameState, Tile } from "../types";

/** A state where AWAY's A_RS sits adjacent to the HOME carrier H_LCM (8,5). */
function duelStart(): GameState {
  const s = createInitialState();
  const pieces = s.pieces.map((p) =>
    p.id === "A_RS" ? { ...p, x: 9, y: 5 } : p,
  );
  return { ...s, pieces };
}

const straightRow = (y: number, size: number): Tile[] =>
  Array.from({ length: size }, (_, x) => ({ x, y }));

describe("duel geometry", () => {
  it("sub-grid size scales with dribble - defense", () => {
    const s = createInitialState();
    const carrier = s.pieces.find((p) => p.id === "H_LCM")!;
    const defender = s.pieces.find((p) => p.id === "A_RS")!;
    // dribble 4 - defense 0 => 3 + 4 = 7
    expect(duelSize(carrier, defender)).toBe(7);
    expect(duelSize(carrier, { ...defender, defensePower: 10 })).toBe(3); // clamped
  });

  it("validates continuous left-to-right paths", () => {
    expect(isValidDuelPath(straightRow(0, 7), 7)).toBe(true);
    // does not start on the left edge
    expect(
      isValidDuelPath(straightRow(0, 7).slice(1), 7),
    ).toBe(false);
    // diagonal jump (non-adjacent)
    expect(
      isValidDuelPath(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        7,
      ),
    ).toBe(false);
  });

  it("detects crossing a blocked cell", () => {
    const path = straightRow(0, 7);
    expect(pathCrossesBlock(path, [{ x: 3, y: 0 }])).toBe(true);
    expect(pathCrossesBlock(path, [{ x: 3, y: 1 }])).toBe(false);
  });
});

describe("duel flow", () => {
  it("initiation enters DUEL without consuming a turn", () => {
    const s1 = applyAction(duelStart(), {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
    });
    expect(s1.phase).toBe("DUEL");
    expect(s1.duel?.carrierId).toBe("H_LCM");
    expect(s1.duel?.defenderId).toBe("A_RS");
    expect(s1.duel?.defenderReady).toBe(false);
    expect(s1.turn).toBe("HOME");
  });

  it("defender block is capped at interceptSlots", () => {
    const s1 = applyAction(duelStart(), {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
    });
    const s2 = applyAction(s1, {
      type: "ANTI_DRIBBLE",
      defenderId: "A_RS",
      blockedCells: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    });
    expect(s2.duel?.blockedCells).toHaveLength(2); // A_RS interceptSlots = 2
    expect(s2.duel?.defenderReady).toBe(true);
  });

  it("intercepts when the path crosses a block (ball to defender)", () => {
    let s = applyAction(duelStart(), {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
    });
    s = applyAction(s, {
      type: "ANTI_DRIBBLE",
      defenderId: "A_RS",
      blockedCells: [{ x: 1, y: 0 }],
    });
    s = applyAction(s, {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
      path: straightRow(0, 7), // crosses (1,0)
    });
    expect(s.phase).toBe("PLAY");
    expect(s.duel).toBeNull();
    expect(s.ball.carrierId).toBe("A_RS"); // intercepted
    expect(s.turn).toBe("AWAY"); // turn consumed
    expect(s.pieces.find((p) => p.id === "H_LCM")).toMatchObject({
      x: 9,
      y: 5,
    }); // carrier advanced onto the contested tile
  });

  it("succeeds when the path avoids blocks (ball kept)", () => {
    let s = applyAction(duelStart(), {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
    });
    s = applyAction(s, {
      type: "ANTI_DRIBBLE",
      defenderId: "A_RS",
      blockedCells: [{ x: 1, y: 0 }],
    });
    s = applyAction(s, {
      type: "DRIBBLE",
      pieceId: "H_LCM",
      defenderId: "A_RS",
      path: straightRow(3, 7), // avoids (1,0)
    });
    expect(s.ball.carrierId).toBe("H_LCM"); // kept
    expect(s.turn).toBe("AWAY");
  });
});
