import type { Player } from "../game/types";

interface Props {
  player: Player;
}

export default function PlayerPiece({player,}: Props) {
  return (
  <div
    className={`player ${
      player.team === "HOME"
        ? "home-player"
        : "away-player"
    }`}
  >
    {player.role}
    <br />
    {player.x},{player.y}
  </div>
);
}