import { Palette } from "./palette";
import type { Point } from "./types";
import type { Color, ColorCode, PaletteData } from "./palette";
import { isSimilar } from "./colors";

import { Aliases, type AliasCode } from "./aliases";

export class Grid {
  gridSize: number;
  grid: ColorCode[][];
  palette: Palette;

  constructor(gridSize: number) {
    this.palette = new Palette();
    const defaultColor = this.palette.getColorCode("#FFFFFF" as Color);
    this.gridSize = gridSize;
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => defaultColor),
    );
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

  isEmpty(aliases: Aliases, { x, y }: Point) {
    const color = this.getCellCode({ x, y });
    const emptyColors = aliases.expand(" " as AliasCode);
    return emptyColors.includes(color);
  }

  setEmpty(aliases: Aliases, { x, y }: Point) {
    if (this.isEmpty(aliases, { x, y })) {
      return;
    }
    const emptyColors = aliases.expand(" " as AliasCode);
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

  getInitialAliases() {
    const defaultAliases = new Aliases();
    const counts = this.countColors();
    const mostCommonColor = [...counts.entries()].reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0];

    counts.forEach((_count, color: ColorCode) => {
      if (
        isSimilar(
          this.palette.getColor(color)!,
          this.palette.getColor(mostCommonColor)!,
        )
      ) {
        defaultAliases.addAlias(" " as AliasCode, color);
      } else {
        defaultAliases.addAlias("#" as AliasCode, color);
      }
    });
    return defaultAliases;
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
      // colors: colors, // Add the new colors structure
    };
  }

  static fromJSON(json: GridData): Grid {
    const grid = new Grid(json.gridSize);
    grid.grid = json.grid;
    grid.palette = new Palette();
    grid.palette = Palette.fromJSON(json.palette);
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
