// Landing (/) — competitive, chess-like entry screen with full match settings.
// Wires the chosen GameConfig into the store before navigating to /game.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import { DEFAULT_CONFIG } from "../game/rules";
import type { GameConfig } from "../game/types";
import "./Landing.css";

const MINUTES_PRESETS = [6, 30, 60, 90];
const TPM_PRESETS = [1, 2, 3];
const GOALS_PRESETS: (number | null)[] = [null, 1, 3, 5];

const TEAM_PALETTE = [
  "#2f6fed",
  "#e23b3b",
  "#f5a623",
  "#15a86b",
  "#9b51e0",
  "#111418",
  "#e8e8e8",
];

export default function Landing() {
  const navigate = useNavigate();
  const newGame = useGameStore((s) => s.newGame);
  const [cfg, setCfg] = useState<GameConfig>(DEFAULT_CONFIG);

  const set = <K extends keyof GameConfig>(key: K, value: GameConfig[K]) =>
    setCfg((c) => ({ ...c, [key]: value }));

  const sameColor = cfg.homeColor === cfg.awayColor;

  function play() {
    if (sameColor) return;
    newGame(cfg);
    navigate("/game");
  }

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden />

      <header className="landing-hero">
        <span className="landing-kicker">JEU DE STRATÉGIE · TOUR PAR TOUR</span>
        <h1 className="landing-title">
          Foot<span>Board</span>
        </h1>
        <p className="landing-tagline">
          Le football pensé comme les échecs. Anticipe, place tes pièces,
          provoque le duel.
        </p>
      </header>

      <section className="settings-card">
        <h2 className="settings-heading">Réglages du match</h2>

        <div className="setting">
          <label>Durée (minutes)</label>
          <div className="segmented">
            {MINUTES_PRESETS.map((m) => (
              <button
                key={m}
                className={cfg.minutes === m ? "seg active" : "seg"}
                onClick={() => set("minutes", m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="setting">
          <label>Tours par minute</label>
          <div className="segmented">
            {TPM_PRESETS.map((t) => (
              <button
                key={t}
                className={cfg.turnsPerMinute === t ? "seg active" : "seg"}
                onClick={() => set("turnsPerMinute", t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="setting">
          <label>Premier à N buts</label>
          <div className="segmented">
            {GOALS_PRESETS.map((g) => (
              <button
                key={String(g)}
                className={cfg.goalsToWin === g ? "seg active" : "seg"}
                onClick={() => set("goalsToWin", g)}
              >
                {g === null ? "Off" : g}
              </button>
            ))}
          </div>
        </div>

        <div className="setting setting-row">
          <label>Mi-temps (inversion à la moitié)</label>
          <button
            className={`toggle ${cfg.halfTimeEnabled ? "on" : ""}`}
            onClick={() => set("halfTimeEnabled", !cfg.halfTimeEnabled)}
            aria-pressed={cfg.halfTimeEnabled}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting setting-row">
          <label>Mode local — 2 joueurs même écran</label>
          <button
            className={`toggle ${cfg.localTwoPlayer ? "on" : ""}`}
            onClick={() => set("localTwoPlayer", !cfg.localTwoPlayer)}
            aria-pressed={cfg.localTwoPlayer}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting">
          <label>Couleur HOME</label>
          <div className="swatches">
            {TEAM_PALETTE.map((c) => (
              <button
                key={`h-${c}`}
                className={`swatch ${cfg.homeColor === c ? "picked" : ""}`}
                style={{ background: c }}
                onClick={() => set("homeColor", c)}
                aria-label={`HOME ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="setting">
          <label>Couleur AWAY</label>
          <div className="swatches">
            {TEAM_PALETTE.map((c) => (
              <button
                key={`a-${c}`}
                className={`swatch ${cfg.awayColor === c ? "picked" : ""}`}
                style={{ background: c }}
                onClick={() => set("awayColor", c)}
                aria-label={`AWAY ${c}`}
              />
            ))}
          </div>
        </div>

        {sameColor && (
          <p className="settings-warn">
            Choisis deux couleurs différentes pour les équipes.
          </p>
        )}

        <button className="play-btn" onClick={play} disabled={sameColor}>
          Jouer
        </button>
      </section>

      <footer className="landing-foot">FootBoard · prototype</footer>
    </div>
  );
}
