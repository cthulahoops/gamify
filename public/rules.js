export function applyRules(rules, grid, player, delta) {
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
        grid.setCell(becomePos, solid);
      } else if (becomeChar === ">") {
        player.x = becomePos.x;
        player.y = becomePos.y;
        grid.setEmpty(becomePos);
      }
    }
    break;
  }
}

function matchRule(grid, player, delta, rule) {
  const playerRuleOffset = rule.match.indexOf(">");
  if (playerRuleOffset === -1) {
    throw new Error("Invalid rule: " + rule.match);
  }

  const matchStart = grid.addVector(
    player,
    vectorMul(delta, -playerRuleOffset),
  );

  const solids = [];
  for (let i = 0; i < rule.match.length; i++) {
    const matchPos = grid.addVector(matchStart, vectorMul(delta, i));

    const matchChar = rule.match[i];
    if (
      matchChar === ">" &&
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
      solids.push(grid.getCell(matchPos));
      continue;
    }

    return null;
  }
  return { matchStart: matchStart, solids: solids };
}

function vectorMul(v, times) {
  return {
    x: v.x * times,
    y: v.y * times,
  };
}
