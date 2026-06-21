import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import { totalTurns } from "../game/rules";
import "./Hud.css";

export default function Hud() {
  const state = useGameStore((s) => s.state);
  const { config, score, turn, turnNumber, half, phase, winner } = state;

  const minute = Math.floor(turnNumber / config.turnsPerMinute);
  const turnsLeft = Math.max(0, totalTurns(config) - turnNumber);

  return (
    <div className="hud">
      <div className="hud-score">
        <span className="hud-team home" style={{ background: config.homeColor }}>
          HOME
        </span>
        <span className="hud-numbers">
          {score.HOME} <span className="hud-dash">–</span> {score.AWAY}
        </span>
        <span className="hud-team away" style={{ background: config.awayColor }}>
          AWAY
        </span>
      </div>

      <div className="hud-clock">
        <span className="hud-minute">{minute}'</span>
        <span className="hud-sub">
          {half === 1 ? "1re" : "2e"} mi-temps · {turnsLeft} tours
        </span>
      </div>

      <div className="hud-turn">
        {phase === "FULLTIME" ? (
          <span className="hud-final">
            Fin · {winner === "DRAW" ? "Match nul" : `${winner} gagne`}
          </span>
        ) : (
          <span
            className="hud-trait"
            style={{
              background: turn === "HOME" ? config.homeColor : config.awayColor,
            }}
          >
            Au trait : {turn}
          </span>
        )}
        <Link className="hud-replay" to="/">
          Rejouer
        </Link>
      </div>
    </div>
  );
}
