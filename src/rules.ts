import { Grid } from "./grid";
import type { Point, Rule } from "./types";
import type { ColorCode } from "./palette";
import type { GameState } from "./types";
import { Aliases } from "./aliases";

export function applyRules(
  gameState: GameState,
  delta: Point,
): { player: Point | null; grid: Grid } {
  const grid = gameState.playState.currentGrid.clone();
  const aliases = gameState.design.aliases;
  const player = gameState.playState.playerPosition;

  if (!player) {
    return { grid, player };
  }

  const match = getFirstMatch(gameState, delta);

  if (!match) {
    return { grid, player };
  }

  let updatedPlayer = null;

  for (let i = 0; i < match.rule.become.length; i++) {
    const becomeChar = match.rule.become[i];

    const becomePos = grid.addVector(match.matchStart, vectorMul(delta, i));

    if (becomeChar === ">") {
      updatedPlayer = { ...becomePos };
      grid.setEmpty(aliases, becomePos);
    } else {
      const updatedColor = getUpdatedColor(
        becomeChar,
        match.captures,
        gameState,
      );
      grid.setCellCode(becomePos, updatedColor);
    }
  }

  return { player: updatedPlayer, grid };
}

function getUpdatedColor(
  becomeChar: string,
  captures: Captures,
  gameState: GameState,
): ColorCode {
  const palette = gameState.design.palette;
  const aliases = gameState.design.aliases;

  if (palette.hasColorCode(becomeChar)) {
    return becomeChar;
  }

  const ourCaptures = captures.get(becomeChar) || [];
  const captured = ourCaptures.shift();
  if (captured !== undefined) {
    return captured;
  }

  const choices = aliases.expand(becomeChar);
  if (choices.length === 0) {
    throw new Error(
      `Alias "${becomeChar}" does not expand to any color codes.`,
    );
  }

  return choices[Math.floor(Math.random() * choices.length)];
}

function getFirstMatch(gameState: GameState, delta: Point): RuleMatch | null {
  const grid = gameState.playState.currentGrid;
  const rules = gameState.design.rules;
  const aliases = gameState.design.aliases;
  const player = gameState.playState.playerPosition;
  if (!player) {
    return null;
  }

  for (const rule of rules) {
    const match = matchRule(aliases, grid, player, delta, rule);
    if (match) {
      return match;
    }
  }
  return null;
}

type RuleMatch = {
  matchStart: Point;
  captures: Map<string, ColorCode[]>;
  rule: Rule;
};

type Captures = Map<string, ColorCode[]>;

function matchRule(
  aliases: Aliases,
  grid: Grid,
  player: Point,
  delta: Point,
  rule: Rule,
): RuleMatch | null {
  const playerRuleOffset = rule.match.indexOf(">");
  if (playerRuleOffset === -1) {
    throw new Error("Invalid rule: " + rule.match);
  }

  const matchStart = grid.addVector(
    player,
    vectorMul(delta, -playerRuleOffset),
  );

  const captures = new Map<string, ColorCode[]>();

  for (let i = 0; i < rule.match.length; i++) {
    const matchPos = grid.addVector(matchStart, vectorMul(delta, i));

    const matchChar = rule.match[i];
    if (
      matchChar === ">" &&
      player &&
      player.x === matchPos.x &&
      player.y === matchPos.y
    ) {
      continue;
    }

    const cellContent = grid.getCellCode(matchPos);

    if (matchChar === cellContent) {
      continue;
    }

    if (aliases.match(matchChar, cellContent)) {
      if (!captures.has(matchChar)) {
        captures.set(matchChar, []);
      }
      captures.get(matchChar)!.push(cellContent);
      continue;
    }

    return null;
  }
  return { matchStart: matchStart, captures: captures, rule: rule };
}

function vectorMul(v: Point, times: number): Point {
  return {
    x: v.x * times,
    y: v.y * times,
  };
}
