import { describe, it, expect } from "vitest";
import { applyAction, createInitialState } from "../engine";
import { endTurn, swapSides } from "../turn";
import { DEFAULT_CONFIG, GRID, halfTimeTurn, totalTurns } from "../rules";
import type { GameConfig, GameState } from "../types";

function tinyConfig(over: Partial<GameConfig> = {}): GameConfig {
  // a 4-turn match (2 min @ 2 t/min), half-time disabled unless asked
  return { ...DEFAULT_CONFIG, minutes: 2, halfTimeEnabled: false, ...over };
}

describe("MOVE action", () => {
  it("moves a piece, advances the turn, and carries the ball", () => {
    const s0 = createInitialState();
    const carrierId = s0.ball.carrierId!;
    const carrier = s0.pieces.find((p) => p.id === carrierId)!;
    const to = { x: carrier.x + 1, y: carrier.y };

    const s1 = applyAction(s0, { type: "MOVE", pieceId: carrierId, to });

    expect(s1).not.toBe(s0); // immutable: new state
    expect(s1.pieces.find((p) => p.id === carrierId)).toMatchObject(to);
    expect(s1.ball).toMatchObject(to); // ball followed its carrier
    expect(s1.turn).toBe("AWAY");
    expect(s1.turnNumber).toBe(1);
  });

  it("rejects moving an opponent's piece (not their turn)", () => {
    const s0 = createInitialState(); // HOME to move
    const away = s0.pieces.find((p) => p.team === "AWAY")!;
    const s1 = applyAction(s0, {
      type: "MOVE",
      pieceId: away.id,
      to: { x: away.x - 1, y: away.y },
    });
    expect(s1).toBe(s0);
  });

  it("rejects an illegal destination (no turn consumed)", () => {
    const s0 = createInitialState();
    const id = s0.pieces[0].id;
    const s1 = applyAction(s0, {
      type: "MOVE",
      pieceId: id,
      to: { x: 99, y: 99 },
    });
    expect(s1).toBe(s0);
  });
});

describe("clock & half-time", () => {
  it("swapSides mirrors x for pieces and ball", () => {
    const s = createInitialState();
    const p0 = s.pieces[0];
    const swapped = swapSides(s);
    expect(swapped.pieces[0].x).toBe(GRID.width - 1 - p0.x);
    expect(swapped.ball.x).toBe(GRID.width - 1 - s.ball.x);
  });

  it("stops play at half-time and resets to the center kickoff", () => {
    const config = tinyConfig({ minutes: 4, halfTimeEnabled: true });
    let s: GameState = createInitialState(config);
    const htt = halfTimeTurn(config);
    const tt = totalTurns(config);
    expect(htt).toBeLessThan(tt);

    // drive endTurn until we cross half-time
    while (s.half === 1 && s.turnNumber < tt) {
      s = endTurn(s);
    }
    expect(s.phase).toBe("HALFTIME"); // game paused
    expect(s.half).toBe(2);
    expect(s.turn).toBe("AWAY"); // AWAY kicks off the 2nd half
    expect(s.ball.carrierId).toBe("A_LCM"); // reset to kickoff carrier
  });

  it("ends the match at full time", () => {
    const config = tinyConfig(); // 4 turns, no half-time
    let s = createInitialState(config);
    const tt = totalTurns(config);
    for (let i = 0; i < tt; i++) s = endTurn(s);
    expect(s.phase).toBe("FULLTIME");
    expect(s.winner).not.toBeNull();
  });
});
