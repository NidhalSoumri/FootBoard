export type Team = "HOME" | "AWAY";

export type Role =
  | "GK"
  | "LB"
  | "LCB"
  | "RCB"
  | "RB"
  | "LM"
  | "LCM"
  | "RCM"
  | "RM"
  | "LS"
  | "RS";

export interface Player {
  id: string;
  team: Team;
  role: Role;

  x: number;
  y: number;

  pass: number; 
  shoot: number;
  goalintercept: number; 
  intercept: number; 
  dribble: number;
  antidribble: number;
  move: string[]; //chooses the pattern with the number
}
export interface Ball {
  x: number;
  y: number;
  carrierId: string | null;
}

export type Turn = "HOME" | "AWAY";

export interface GameState {
  players: Player[];
  ball: Ball;
  turn: Turn;
}