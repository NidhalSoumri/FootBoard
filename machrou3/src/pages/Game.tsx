// Game (/game) — the match screen: HUD + board + action menu, all store-bound.
// DuelOverlay / GoalkeeperPrompt are wired in later steps.
import Board from "../components/Board";
import Hud from "../components/Hud";
import ActionMenu from "../components/ActionMenu";
import DuelOverlay from "../components/DuelOverlay";
import GoalkeeperPrompt from "../components/GoalkeeperPrompt";
import HalfTimePrompt from "../components/HalfTimePrompt";
import "./Game.css";

export default function Game() {
  return (
    <div className="game-page">
      <Hud />
      <div className="game-main">
        <Board />
        <ActionMenu />
      </div>
      <DuelOverlay />
      <GoalkeeperPrompt />
      <HalfTimePrompt />
    </div>
  );
}
