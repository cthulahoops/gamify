import type { Grid } from "./grid";
import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
export type Rule = {
  match: string;
  become: string;
};

export type GameState = {
  rules: Rule[];
  grid: Grid;
  player: Point | null;
  palette: Palette;
  aliases: Aliases;
};

export type Player = Point | null;

export type Point = {
  x: number;
  y: number;
};
