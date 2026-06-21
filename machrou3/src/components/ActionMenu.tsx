import { useGameStore } from "../state/gameStore";
import {
  canShoot,
  crossTargets,
  dribbleTargets,
  passTargets,
} from "../game/targeting";
import { attackDir } from "../game/rules";
import "./ActionMenu.css";

/**
 * Action panel for the selected piece. Each button sets a target mode the Board
 * reads to highlight valid tiles (move cells, receivers, dribble targets, or the
 * goal mouth for a shot); the actual action is dispatched on the board click.
 */
export default function ActionMenu() {
  const state = useGameStore((s) => s.state);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const actionMode = useGameStore((s) => s.actionMode);
  const setActionMode = useGameStore((s) => s.setActionMode);
  const select = useGameStore((s) => s.select);

  const piece = state.pieces.find((p) => p.id === selectedPieceId);

  if (state.phase !== "PLAY") {
    return (
      <aside className="action-menu">
        <p className="am-hint">Match terminé.</p>
      </aside>
    );
  }

  if (!piece) {
    return (
      <aside className="action-menu">
        <p className="am-hint">
          Sélectionne une pièce de l'équipe <b>{state.turn}</b> pour agir.
        </p>
      </aside>
    );
  }

  const isCarrier = state.ball.carrierId === piece.id;
  const dir = attackDir(piece.team, state.half);
  const canPass = isCarrier && passTargets(state.pieces, piece).length > 0;
  const canCross = isCarrier && crossTargets(state.pieces, piece).length > 0;
  const canDribble =
    isCarrier && dribbleTargets(state.pieces, piece, dir).length > 0;
  const shootable = isCarrier && canShoot(piece, state.half);

  return (
    <aside className="action-menu">
      <header className="am-head">
        <span className="am-role">{piece.role}</span>
        <span className="am-team">{piece.team}</span>
        {isCarrier && <span className="am-ball">●&nbsp;ballon</span>}
      </header>

      <button
        className={`am-btn ${actionMode === "MOVE" ? "active" : ""}`}
        onClick={() => setActionMode("MOVE")}
      >
        Déplacer
      </button>

      <button
        className={`am-btn ${actionMode === "PASS" ? "active" : ""}`}
        onClick={() => setActionMode("PASS")}
        disabled={!canPass}
      >
        Passer
      </button>

      <button
        className={`am-btn ${actionMode === "CROSS" ? "active" : ""}`}
        onClick={() => setActionMode("CROSS")}
        disabled={!canCross}
      >
        Centrer
      </button>

      <button
        className={`am-btn am-shoot ${actionMode === "SHOOT" ? "active" : ""}`}
        onClick={() => setActionMode("SHOOT")}
        disabled={!shootable}
      >
        Tirer
      </button>

      <button
        className={`am-btn am-dribble ${actionMode === "DRIBBLE" ? "active" : ""}`}
        onClick={() => setActionMode("DRIBBLE")}
        disabled={!canDribble}
      >
        Dribble (duel)
      </button>

      <button className="am-btn am-cancel" onClick={() => select(null)}>
        Annuler
      </button>

      <p className="am-tip">
        {actionMode === "MOVE" && "Clique une case jaune pour te déplacer."}
        {actionMode === "PASS" && "Clique un coéquipier surligné pour passer."}
        {actionMode === "CROSS" && "Clique un coéquipier surligné pour centrer."}
        {actionMode === "DRIBBLE" && "Clique un adversaire surligné pour le défier."}
        {actionMode === "SHOOT" && "Vise une lucarne du but (cases orange)."}
      </p>
    </aside>
  );
}
