import type { Grid } from "./grid";
import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
export type Rule = {
  match: string;
  become: string;
};

export type GameDesign = {
  originalGrid: Grid;
  playerSpawnPosition: Point;
  palette: Palette;
  aliases: Aliases;
  rules: Rule[];
};

export type GamePlayState = {
  currentGrid: Grid;
  playerPosition: Point | null;
};

export type GameState = {
  design: GameDesign;
  playState: GamePlayState;
};

export type GameStateDTO = {
  palette: [string, string][];
  aliases: Record<string, string[]>;
  rules: { match: string; become: string }[];
  grid: { size: { x: number; y: number }; data: string[] };
  player: { x: number; y: number };
};

export type Player = Point | null;

export type Point = {
  x: number;
  y: number;
};

export type RuleLocation = {
  ruleIndex: number;
  side: "match" | "become";
  position: number;
};

export type RuleBlockDragItem = {
  type: "RULE_BLOCK";
  source: RuleLocation;
  symbol: string;
};

export type AliasBlockDragItem = {
  type: "ALIAS_BLOCK";
  sourceAlias: string;
  sourceIndex: number;
  symbol: string;
};

export type RuleDragItem = {
  type: "RULE_REORDER";
  sourceRuleIndex: number;
};

export type BlockDragItem = AliasBlockDragItem | RuleBlockDragItem;
export type DragItem = BlockDragItem | RuleDragItem;
