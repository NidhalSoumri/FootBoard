import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { attackingGoalX, GOAL } from "../game/rules";
import "./Prompt.css";

const other = (t: "HOME" | "AWAY") => (t === "HOME" ? "AWAY" : "HOME");

/**
 * Goalkeeper save prompt. The defending keeper picks a save point on the goal
 * mouth (blind to the shooter's aim); on validation the aim is revealed and the
 * outcome (save within goalInterceptPower, else goal) is shown before applying.
 */
export default function GoalkeeperPrompt() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const shot = state.pendingShot;
  if (state.phase !== "GOALKEEPER" || !shot) return null;

  const defending = other(shot.team);
  const gk = state.pieces.find((p) => p.team === defending && p.role === "GK");
  if (!gk) return null;

  const goalX = attackingGoalX(shot.team, state.half);
  const saved = pick != null && Math.abs(pick - shot.target.y) <= gk.goalInterceptPower;

  function finish() {
    if (pick == null || !gk) return;
    dispatch({
      type: "GOALKEEPER_SAVE",
      goalkeeperId: gk.id,
      savePoint: { x: goalX, y: pick },
    });
  }

  const rows = [];
  for (let y = GOAL.yMin; y <= GOAL.yMax; y++) {
    let cls = "mouth-cell";
    if (pick === y) cls += " picked";
    if (revealed && y === shot.target.y) cls += " aim";
    if (revealed && saved && pick === y) cls += " saved";
    rows.push(
      <div
        key={y}
        className={cls}
        onClick={() => !revealed && setPick(y)}
      >
        {revealed && y === shot.target.y ? "tir" : `lucarne ${y - GOAL.yMin + 1}`}
      </div>,
    );
  }

  return (
    <div className="prompt-backdrop">
      <div className="prompt-modal">
        <h2>Arrêt du gardien</h2>
        <p className="prompt-text">
          Gardien <b>{defending}</b> — choisis ton point d'arrêt. Tu ne vois pas
          où le tireur vise.
        </p>

        <div className="goal-mouth">{rows}</div>

        {revealed && (
          <p className={`prompt-result ${saved ? "good" : "bad"}`}>
            {saved ? "Arrêt ! Le gardien capte le ballon." : "But !"}
          </p>
        )}

        {!revealed ? (
          <button
            className="prompt-btn"
            onClick={() => setRevealed(true)}
            disabled={pick == null}
          >
            Valider l'arrêt
          </button>
        ) : (
          <button className="prompt-btn" onClick={finish}>
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}
