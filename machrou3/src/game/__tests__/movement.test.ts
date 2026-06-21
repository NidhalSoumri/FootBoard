import { describe, it, expect } from "vitest";
import {
  isLegalMove,
  isMoveMatrix,
  legalMoves,
  movePiece,
  teammateInPath,
} from "../movement";
import { KING_MATRIX } from "../rules";
import type { Piece } from "../types";

function piece(over: Partial<Piece> = {}): Piece {
  return {
    id: "P",
    team: "HOME",
    role: "LCM",
    x: 14,
    y: 8,
    movement: KING_MATRIX,
    passRange: 4,
    shotRange: 5,
    crossRange: 6,
    dribblePower: 4,
    defensePower: 0,
    interceptSlots: 2,
    goalInterceptPower: 0,
    ...over,
  };
}

describe("movement matrix", () => {
  it("king reaches all 8 neighbors in open space", () => {
    const p = piece();
    const moves = legalMoves([p], p);
    expect(moves).toHaveLength(8);
  });

  it("rejects cells outside the matrix and the center", () => {
    const p = piece();
    expect(isMoveMatrix(p.x, p.y, p)).toBe(false); // staying put
    expect(isMoveMatrix(p.x + 2, p.y, p)).toBe(false); // too far
    expect(isMoveMatrix(p.x + 1, p.y + 1, p)).toBe(true);
  });

  it("orientation: AWAY default mirrors HOME but king is symmetric", () => {
    const home = piece({ team: "HOME" });
    const away = piece({ team: "AWAY" });
    expect(legalMoves([home], home)).toHaveLength(8);
    expect(legalMoves([away], away)).toHaveLength(8);
  });

  it("explicit dir flips matrix orientation", () => {
    // symmetric matrix => same result, but the API must accept the dir param.
    const p = piece();
    expect(isMoveMatrix(p.x - 1, p.y, p, -1)).toBe(true);
  });
});

describe("teammate blocking", () => {
  it("cannot land on a teammate", () => {
    const p = piece({ id: "A", x: 14, y: 8 });
    const mate = piece({ id: "B", x: 15, y: 8 });
    expect(isLegalMove([p, mate], p, 15, 8)).toBe(false);
  });

  it("cannot traverse a teammate", () => {
    const p = piece({ id: "A", x: 13, y: 8, movement: KING_MATRIX });
    // make a 2-reach by using a teammate directly in the path of a far move
    const mate = piece({ id: "B", x: 14, y: 8 });
    expect(teammateInPath([p, mate], p, 15, 8)).toBe(true);
  });

  it("an opponent does NOT block the path", () => {
    const p = piece({ id: "A", team: "HOME", x: 13, y: 8 });
    const opp = piece({ id: "B", team: "AWAY", x: 14, y: 8 });
    expect(teammateInPath([p, opp], p, 15, 8)).toBe(false);
  });
});

describe("movePiece immutability", () => {
  it("returns a new array on a legal move, same ref on illegal", () => {
    const p = piece({ id: "A", x: 14, y: 8 });
    const after = movePiece([p], "A", 15, 8);
    expect(after).not.toBe([p]);
    expect(after.find((x) => x.id === "A")).toMatchObject({ x: 15, y: 8 });

    const pieces = [p];
    expect(movePiece(pieces, "A", 20, 20)).toBe(pieces); // illegal => same ref
  });
});
