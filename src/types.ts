import type { Grid } from "./grid";

export type Rule = {
  match: string;
  become: string;
};

export type GameState = {
  rules: Rule[];
  grid?: Grid | null;
  player: Point | null;
};

export type Player = Point | null;

export type Point = {
  x: number;
  y: number;
};
