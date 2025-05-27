import type { Point } from "./types";
import type { ColorCode } from "./palette";
import { Aliases } from "./aliases";

export class Grid {
  gridSize: number;
  grid: ColorCode[][];

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => "A" as ColorCode),
    );
  }

  getCellCode({ x, y }: Point): ColorCode {
    return this.grid[y][x];
  }

  setCellCode({ x, y }: Point, colorCode: ColorCode) {
    this.grid[y][x] = colorCode;
  }

  isEmpty(aliases: Aliases, { x, y }: Point) {
    const color = this.getCellCode({ x, y });
    const emptyColors = aliases.expand(" ");
    return emptyColors.includes(color);
  }

  setEmpty(aliases: Aliases, { x, y }: Point) {
    if (this.isEmpty(aliases, { x, y })) {
      return;
    }
    const emptyColors = aliases.expand(" ");
    this.setCellCode({ x, y }, emptyColors[0]);
  }

  countColors() {
    const colorCounts = new Map();
    this.forEach(({ color }) => {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });
    return colorCounts;
  }

  addVector(v1: Point, v2: Point): Point {
    return {
      x: mod(v1.x + v2.x, this.gridSize),
      y: mod(v1.y + v2.y, this.gridSize),
    };
  }

  forEach(callback: (point: Point & { color: ColorCode }) => void) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        callback({ x, y, color: this.grid[y][x] });
      }
    }
  }

  toJSON(): GridData {
    return {
      size: { x: this.gridSize, y: this.gridSize },
      data: this.grid.map((row) => row.join("")),
    };
  }

  static fromJSON(json: GridData): Grid {
    const grid = new Grid(json.size.x); // y size is ignored for now, only squares!
    grid.grid = json.data.map((x) => Array.from(x) as ColorCode[]);
    return grid;
  }

  clone(): Grid {
    const cloned = new Grid(this.gridSize);
    cloned.grid = this.grid.map((row) => [...row]);
    return cloned;
  }
}

type GridData = {
  size: { x: number; y: number };
  data: string[];
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
