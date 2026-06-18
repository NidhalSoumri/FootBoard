import { players } from "./formation";
import type { Player } from "./types";

export function teammateInPath(
  players: Player[],
  movingPlayer: Player,
  targetX: number,
  targetY: number
): boolean {
  const x1 = movingPlayer.x;
  const y1 = movingPlayer.y;
  const x2 = targetX;
  const y2 = targetY;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const lengthSquared = dx * dx + dy * dy;

  return players.some(player => {
    if (
      player.id === movingPlayer.id ||
      player.team !== movingPlayer.team
    ) {
      return false;
    }

    // projection factor along segment
    const t =
      ((player.x - x1) * dx +
        (player.y - y1) * dy) /
      lengthSquared;

    // outside segment
    if (t < 0 || t > 1) {
      return false;
    }

    // closest point on segment
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const dist = Math.sqrt(
      (player.x - closestX) ** 2 +
      (player.y - closestY) ** 2
    );

    return dist <= 0.5;
  });
}


export function movePlayer(
  players: Player[],
  playerId: string,
  targetX: number,
  targetY: number
): Player[] {
  const movingPlayer = players.find(
    p => p.id === playerId
  );

  if (!movingPlayer) return players;

  // teammate already there ?
  const teammateOnSquare = players.find(
  p =>
    p.team === movingPlayer.team &&
    p.x === targetX &&
    p.y === targetY
);

if (teammateOnSquare) {
  return players;
}

if (
  teammateInPath(
    players,
    movingPlayer,
    targetX,
    targetY
  )
) {
  return players;
}

  return players.map(player =>
    player.id === playerId
      ? {
          ...player,
          x: targetX,
          y: targetY,
        }
      : player
  );
}
/* Changed to a matrix movement unable to use single digit id for movement could be errased
//moovement patterns:
// pattern 1 cross
export function isMove1(
  x: number,
  y: number,
  selectedPlayer: Player
) {
  if (!selectedPlayer) return false;

  const dx = Math.abs(
    x - selectedPlayer.x
  );

  const dy = Math.abs(
    y - selectedPlayer.y
  );

return (
  dx+dy === 1
);
}
// pattern 2 chess king
export function isMove2(
  x: number,
  y: number,
  selectedPlayer: Player
) {
  if (!selectedPlayer) return false;

  const dx = Math.abs(
    x - selectedPlayer.x
  );

  const dy = Math.abs(
    y - selectedPlayer.y
  );

return (
  Math.max(dx, dy) === 1
);
}
// pattern 3 diamond radius 2
export function isMove3(
  x: number,
  y: number,
  selectedPlayer: Player
) {
  if (!selectedPlayer) return false;

  const dx = Math.abs(
    x - selectedPlayer.x
  );

  const dy = Math.abs(
    y - selectedPlayer.y
  );

return (
  dx+dy <= 10
);
}
*/
export function isMoveMatrix(
  x: number,
  y: number,
  selectedPlayer: Player
) {
  if (!selectedPlayer) return false;
  const team = selectedPlayer.team;
  const lengthOfMatrix = selectedPlayer.move.length;
  const maximumDistance = (lengthOfMatrix-1)/2;
  const dx =
    x - selectedPlayer.x;

  const dy =
    y - selectedPlayer.y;
  if(Math.abs(dx)>maximumDistance || Math.abs(dy)>maximumDistance ){
    return false;
  }

const row =
  team === "HOME"
    ? maximumDistance - dx
    : maximumDistance + dx;

const col =
  team === "HOME"
    ? maximumDistance + dy
    : maximumDistance - dy;
  const matrice = selectedPlayer.move;

  const value = matrice[row][col];

  if (value === "0") {
    return false;
  } 
  else {
    return true;
  }

}