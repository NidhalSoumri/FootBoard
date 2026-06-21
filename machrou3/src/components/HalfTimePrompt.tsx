import { useGameStore } from "../state/gameStore";
import "./Prompt.css";

/** Half-time pause: the game stops, sides have swapped and play is reset to the
 *  center kickoff. Click to resume the second half. */
export default function HalfTimePrompt() {
  const phase = useGameStore((s) => s.state.phase);
  const resume = useGameStore((s) => s.resume);

  if (phase !== "HALFTIME") return null;

  return (
    <div className="prompt-backdrop">
      <div className="prompt-modal">
        <h2>Mi-temps</h2>
        <p className="prompt-text">
          Les équipes changent de côté et le jeu repart du centre. AWAY engage la
          seconde mi-temps.
        </p>
        <button className="prompt-btn" onClick={resume}>
          Reprendre la 2<sup>e</sup> mi-temps
        </button>
      </div>
    </div>
  );
}
