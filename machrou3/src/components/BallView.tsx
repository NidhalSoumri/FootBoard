import ballImage from "../assets/BALL.png";

interface Props {
  left: number;
  top: number;
}

/** The ball sprite, absolutely positioned by the Board. */
export default function BallView({ left, top }: Props) {
  return (
    <div className="ball" style={{ left, top }}>
      <img src={ballImage} alt="ball" />
    </div>
  );
}
