import type { Piece } from "../game/types";

interface Props {
  piece: Piece;
  color: string;
  selected: boolean;
  selectable: boolean;
}

/**
 * Placeholder piece: colored shape + role initials. GK gets a rounded square so
 * it reads differently from outfield circles. Real sprites can drop in later
 * (src/assets/) without touching layout.
 */
export default function PieceView({ piece, color, selected, selectable }: Props) {
  const isGk = piece.role === "GK";
  return (
    <div
      className={[
        "piece",
        isGk ? "piece-gk" : "piece-outfield",
        selected ? "piece-selected" : "",
        selectable ? "piece-selectable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ background: color }}
      title={piece.role}
    >
      <span className="piece-role">{piece.role}</span>
    </div>
  );
}
