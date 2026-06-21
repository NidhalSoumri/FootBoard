interface Props {
  className: string;
  onClick: () => void;
}

/** A single pitch cell. Presentational only — all markings come via className. */
export default function Tile({ className, onClick }: Props) {
  return <div className={className} onClick={onClick} />;
}
