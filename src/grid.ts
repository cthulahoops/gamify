import { Palette } from "./palette";
import type { Point } from "./types";
import type { Color, ColorCode, PaletteData } from "./palette";

export class Grid {
  gridSize: number;
  grid: ColorCode[][];
  colorStates: Map<ColorCode, boolean>;
  palette: Palette;

  constructor(gridSize: number) {
    this.palette = new Palette();
    const defaultColor = this.palette.getColorCode("#FFFFFF" as Color);
    this.gridSize = gridSize;
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => defaultColor),
    );
    this.colorStates = new Map();
  }

  getCell({ x, y }: Point): Color {
    const color = this.palette.getColor(this.grid[y][x])!;
    if (!color) {
      throw new Error(`Color not found for code: ${this.grid[y][x]}`);
    }
    return color;
  }

  getCellCode({ x, y }: Point): ColorCode {
    return this.grid[y][x];
  }

  setCell({ x, y }: Point, color: Color) {
    this.grid[y][x] = this.palette.getColorCode(color);
  }

  setCellCode({ x, y }: Point, colorCode: ColorCode) {
    this.grid[y][x] = colorCode;
  }

  isEmpty({ x, y }: Point) {
    const color = this.getCellCode({ x, y });
    return !this.colorStates.get(color);
  }

  setEmpty({ x, y }: Point) {
    if (this.isEmpty({ x, y })) {
      return;
    }
    for (const [color, isSolid] of this.colorStates.entries()) {
      if (!isSolid) {
        this.setCellCode({ x, y }, color);
        return;
      }
    }
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

  setupColorStates() {
    const counts = this.countColors();
    const mostCommonColor = [...counts.entries()].reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    counts.forEach((_count, color) => {
      this.colorStates.set(color, color !== mostCommonColor);
    });
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
      palette: this.palette.toJSON(),
      colorStates: Array.from(this.colorStates.entries()),
      // colors: colors, // Add the new colors structure
    };
  }

  static fromJSON(json: GridData): Grid {
    const grid = new Grid(json.gridSize);
    grid.grid = json.grid;
    grid.palette = new Palette();
    grid.palette = Palette.fromJSON(json.palette);
    grid.colorStates = new Map(json.colorStates);
    return grid;
  }
}

type GridData = {
  gridSize: number;
  grid: ColorCode[][];
  palette: PaletteData;
  colorStates: Map<ColorCode, boolean>;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
