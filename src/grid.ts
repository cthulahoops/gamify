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

  toJSON() {
    // // Create the colors structure
    // const colors = {
    //   properties: {
    //     solid: [],
    //     empty: [],
    //   },
    //   palette: {},
    // };

    // // Populate the properties based on colorStates
    // this.colorStates.forEach((isSolid, code) => {
    //   if (isSolid) {
    //     colors.properties.solid.push(code);
    //   } else {
    //     colors.properties.empty.push(code);
    //   }
    // });

    // // Populate the palette
    // this.palette.code_to_color.forEach((hexColor, code) => {
    //   colors.palette[code] = hexColor;
    // });

    return {
      gridSize: this.gridSize,
      grid: this.grid,
    };
  }

  static fromJSON(json: GridData): Grid {
    const grid = new Grid(json.gridSize);
    grid.grid = json.grid.map((x) => Array.from(x));
    return grid;
  }
}

type GridData = {
  gridSize: number;
  grid: ColorCode[][];
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
