
// ============================================================================
// Movement rules. Pure functions over Piece[]. Core rule: two pieces of the
// SAME team may neither occupy nor traverse the same tile.
// ============================================================================

import type { Piece, Tile } from "./types";

/**
 * Default attack direction from team identity (first-half orientation):
 * HOME attacks +x, AWAY attacks -x. The engine passes an explicit direction
 * when sides have swapped at half-time.
 */
export function defaultDir(piece: Piece): 1 | -1 {
  return piece.team === "HOME" ? 1 : -1;
}

/**
 * True if a teammate lies on the straight segment from the moving piece to
 * (targetX, targetY) — used to forbid jumping over your own players.
 */
export function teammateInPath(
  pieces: Piece[],
  movingPiece: Piece,
  targetX: number,
  targetY: number,
): boolean {
  const x1 = movingPiece.x;
  const y1 = movingPiece.y;
  const dx = targetX - x1;
  const dy = targetY - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return false;

  return pieces.some((piece) => {
    if (piece.id === movingPiece.id || piece.team !== movingPiece.team) {
      return false;
    }

    // projection factor of the piece onto the segment
    const t = ((piece.x - x1) * dx + (piece.y - y1) * dy) / lengthSquared;
    if (t < 0 || t > 1) return false;

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    const dist = Math.sqrt(
      (piece.x - closestX) ** 2 + (piece.y - closestY) ** 2,
    );
    return dist <= 0.5;
  });
}

/**
 * Is (x, y) a legal landing cell per the piece's team-relative movement matrix?
 * HOME attacks +x; AWAY attacks -x — orientation is resolved here.
 */
export function isMoveMatrix(
  x: number,
  y: number,
  piece: Piece,
  dir: 1 | -1 = defaultDir(piece),
): boolean {
  if (!piece) return false;

  const lengthOfMatrix = piece.movement.length;
  const maxDistance = (lengthOfMatrix - 1) / 2;
  const dx = x - piece.x;
  const dy = y - piece.y;

  if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
    return false;
  }

  // dir === 1: piece attacks +x; dir === -1: attacks -x (sides swapped).
  const row = dir === 1 ? maxDistance - dx : maxDistance + dx;
  const col = dir === 1 ? maxDistance + dy : maxDistance - dy;

  return piece.movement[row][col] === "1";
}

/**
 * Full legality check for a single tile: on the matrix, not onto a teammate,
 * and not jumping over a teammate.
 */
export function isLegalMove(
  pieces: Piece[],
  piece: Piece,
  x: number,
  y: number,
  dir: 1 | -1 = defaultDir(piece),
): boolean {
  if (!isMoveMatrix(x, y, piece, dir)) return false;

  const teammateOnSquare = pieces.some(
    (p) => p.team === piece.team && p.x === x && p.y === y,
  );
  if (teammateOnSquare) return false;

  if (teammateInPath(pieces, piece, x, y)) return false;

  return true;
}

/** All legal destination tiles for a piece. */
export function legalMoves(
  pieces: Piece[],
  piece: Piece,
  dir: 1 | -1 = defaultDir(piece),
): Tile[] {
  const tiles: Tile[] = [];
  const maxDistance = (piece.movement.length - 1) / 2;
  for (let dx = -maxDistance; dx <= maxDistance; dx++) {
    for (let dy = -maxDistance; dy <= maxDistance; dy++) {
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (isLegalMove(pieces, piece, x, y, dir)) tiles.push({ x, y });
    }
  }
  return tiles;
}

/**
 * Immutable move. Returns the SAME array reference if illegal (callers can use
 * identity to detect rejection) and a new array with the moved piece otherwise.
 */
export function movePiece(
  pieces: Piece[],
  pieceId: string,
  targetX: number,
  targetY: number,
  dir?: 1 | -1,
): Piece[] {
  const movingPiece = pieces.find((p) => p.id === pieceId);
  if (!movingPiece) return pieces;
  const d = dir ?? defaultDir(movingPiece);
  if (!isLegalMove(pieces, movingPiece, targetX, targetY, d)) return pieces;

  return pieces.map((piece) =>
    piece.id === pieceId ? { ...piece, x: targetX, y: targetY } : piece,
  );
}
