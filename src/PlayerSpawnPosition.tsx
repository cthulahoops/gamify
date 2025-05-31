import type { Point } from "./types";
import type { Aliases } from "./aliases";
import type { Grid } from "./grid";

import { findRandomEmpty } from "./useGameState";

type PlayerSpawnPositionProps = {
  aliases: Aliases;
  grid: Grid;
  position: Point;
  setPosition: (position: Point) => void;
};

export function PlayerSpawnPosition({
  aliases,
  grid,
  position,
  setPosition,
}: PlayerSpawnPositionProps) {
  return (
    <div className="flex-column">
      <label>
        X:{" "}
        <input
          type="number"
          value={position.x}
          onChange={(e) =>
            setPosition({
              ...position,
              x: mod(parseInt(e.target.value, 10), grid.width),
            })
          }
        />
      </label>
      <label>
        Y:{" "}
        <input
          type="number"
          value={position.y}
          onChange={(e) =>
            setPosition({
              ...position,
              y: mod(parseInt(e.target.value, 10), grid.height),
            })
          }
        />
      </label>
      <button onClick={() => setPosition(findRandomEmpty(aliases, grid))}>
        Select Random
      </button>
    </div>
  );
}

function mod(x: number, y: number): number {
  return ((x % y) + y) % y;
}
