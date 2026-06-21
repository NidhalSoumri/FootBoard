import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { isValidDuelPath, pathCrossesBlock } from "../game/duel";
import type { Tile } from "../game/types";
import "./DuelOverlay.css";

const eq = (a: Tile, b: Tile) => a.x === b.x && a.y === b.y;
const has = (cells: Tile[], c: Tile) => cells.some((t) => eq(t, c));

/**
 * Duel sub-grid pop-up. Two stages:
 *  1. DEFENDER colors up to interceptSlots cells (hidden from the carrier).
 *  2. CARRIER traces a continuous path from the left edge (entry) to the right
 *     edge (exit), blind to the blocks; on validation the blocks are revealed.
 */
export default function DuelOverlay() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const [blocked, setBlocked] = useState<Tile[]>([]);
  const [path, setPath] = useState<Tile[]>([]);
  const [revealed, setRevealed] = useState(false);

  const duel = state.duel;
  if (state.phase !== "DUEL" || !duel) return null;

  const carrier = state.pieces.find((p) => p.id === duel.carrierId);
  const defender = state.pieces.find((p) => p.id === duel.defenderId);
  if (!carrier || !defender) return null;

  const size = duel.size;
  const slots = defender.interceptSlots;
  const stage: "DEFENDER" | "CARRIER" = duel.defenderReady
    ? "CARRIER"
    : "DEFENDER";

  // ---- defender interactions ----
  function toggleBlock(c: Tile) {
    setBlocked((prev) => {
      if (has(prev, c)) return prev.filter((t) => !eq(t, c));
      if (prev.length >= slots) return prev;
      return [...prev, c];
    });
  }

  function commitBlocks() {
    dispatch({
      type: "ANTI_DRIBBLE",
      defenderId: defender!.id,
      blockedCells: blocked,
    });
  }

  // ---- carrier interactions ----
  function extendPath(c: Tile) {
    if (revealed) return;
    setPath((prev) => {
      if (prev.length === 0) return c.x === 0 ? [c] : prev; // must enter on left
      const last = prev[prev.length - 1];
      if (eq(last, c)) return prev.slice(0, -1); // click last => undo
      if (has(prev, c)) return prev;
      const manhattan = Math.abs(c.x - last.x) + Math.abs(c.y - last.y);
      return manhattan === 1 ? [...prev, c] : prev;
    });
  }

  function validatePath() {
    if (isValidDuelPath(path, size)) setRevealed(true);
  }

  function finish() {
    dispatch({
      type: "DRIBBLE",
      pieceId: carrier!.id,
      defenderId: defender!.id,
      path,
    });
  }

  const intercepted = pathCrossesBlock(path, duel.blockedCells);

  // ---- render the sub-grid ----
  const rows = [];
  for (let y = 0; y < size; y++) {
    const cells = [];
    for (let x = 0; x < size; x++) {
      const c = { x, y };
      let cls = "duel-cell";
      if (x === 0) cls += " entry";
      if (x === size - 1) cls += " exit";

      if (stage === "DEFENDER") {
        if (has(blocked, c)) cls += " blocked";
      } else {
        const inPath = has(path, c);
        if (inPath) cls += " path";
        if (revealed && has(duel.blockedCells, c)) cls += " blocked";
        if (revealed && inPath && has(duel.blockedCells, c)) cls += " hit";
      }

      cells.push(
        <div
          key={`${x}-${y}`}
          className={cls}
          onClick={() =>
            stage === "DEFENDER" ? toggleBlock(c) : extendPath(c)
          }
        />,
      );
    }
    rows.push(
      <div key={y} className="duel-row">
        {cells}
      </div>,
    );
  }

  return (
    <div className="duel-backdrop">
      <div className="duel-modal">
        <header className="duel-head">
          <h2>Duel</h2>
          <span className="duel-vs">
            <b style={{ color: stateColor(state, carrier.team) }}>
              {carrier.role}
            </b>{" "}
            dribble{" "}
            <b style={{ color: stateColor(state, defender.team) }}>
              {defender.role}
            </b>
          </span>
        </header>

        {stage === "DEFENDER" && (
          <p className="duel-tip">
            <b>Défenseur ({defender.team})</b> — colorie jusqu'à {slots} case
            {slots > 1 ? "s" : ""} pour intercepter ({blocked.length}/{slots}).
            Le porteur ne les verra pas.
          </p>
        )}
        {stage === "CARRIER" && !revealed && (
          <p className="duel-tip">
            <b>Porteur ({carrier.team})</b> — trace un chemin continu de l'entrée
            (gauche) à la sortie (droite).
          </p>
        )}
        {stage === "CARRIER" && revealed && (
          <p className={`duel-result ${intercepted ? "bad" : "good"}`}>
            {intercepted
              ? "Balle interceptée ! Le porteur continue sans le ballon."
              : "Dribble réussi ! Le porteur garde le ballon."}
          </p>
        )}

        <div className="duel-grid">{rows}</div>

        <footer className="duel-foot">
          {stage === "DEFENDER" && (
            <button className="duel-btn primary" onClick={commitBlocks}>
              Valider le blocage
            </button>
          )}
          {stage === "CARRIER" && !revealed && (
            <>
              <button className="duel-btn" onClick={() => setPath([])}>
                Effacer
              </button>
              <button
                className="duel-btn primary"
                onClick={validatePath}
                disabled={!isValidDuelPath(path, size)}
              >
                Valider le dribble
              </button>
            </>
          )}
          {stage === "CARRIER" && revealed && (
            <button className="duel-btn primary" onClick={finish}>
              Continuer
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function stateColor(
  state: { config: { homeColor: string; awayColor: string } },
  team: "HOME" | "AWAY",
): string {
  return team === "HOME" ? state.config.homeColor : state.config.awayColor;
}
