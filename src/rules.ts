import { Grid } from "./grid";
import type { Point, Rule } from "./types";
import type { ColorCode } from "./palette";

export function applyRules(
  rules: Rule[],
  grid: Grid,
  player: Point,
  delta: Point,
) {
  for (const rule of rules) {
    const match = matchRule(grid, player, delta, rule);
    if (!match) {
      continue;
    }

    for (let i = 0; i < rule.become.length; i++) {
      const becomeChar = rule.become[i];

      const becomePos = grid.addVector(match.matchStart, vectorMul(delta, i));
      if (becomeChar === " ") {
        grid.setEmpty(becomePos);
      } else if (becomeChar === "#") {
        const solid = match.solids.shift();
        if (!solid) {
          throw new Error("No solid found for become #");
        }
        grid.setCellCode(becomePos, solid);
      } else if (becomeChar === ">") {
        player = { ...becomePos };
        grid.setEmpty(becomePos);
      } else {
        grid.setCellCode(becomePos, becomeChar as ColorCode);
      }
    }
    break;
  }

  return { player, grid };
}

type RuleMatch = {
  matchStart: Point;
  solids: ColorCode[];
};

function matchRule(
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

  const solids: ColorCode[] = [];
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

    const isEmpty = grid.isEmpty(matchPos);

    if (isEmpty && matchChar === " ") {
      continue;
    }

    if (!isEmpty && matchChar === "#") {
      solids.push(grid.getCellCode(matchPos));
      continue;
    }

    if (matchChar === "?") {
      continue;
    }

    if (matchChar == grid.getCellCode(matchPos)) {
      continue;
    }

    return null;
  }
  return { matchStart: matchStart, solids: solids };
}

function vectorMul(v: Point, times: number): Point {
  return {
    x: v.x * times,
    y: v.y * times,
  };
}
