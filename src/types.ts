import type { Grid } from "./grid";
import type { Aliases } from "./aliases";

export type Rule = {
  match: string;
  become: string;
};

export type GameState = {
  rules: Rule[];
  grid: Grid;
  player: Point | null;
  aliases: Aliases;
};

export type Player = Point | null;

export type Point = {
  x: number;
  y: number;
};
