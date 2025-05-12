import { Palette } from "./palette.js";

export class Grid {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => [255, 255, 255]),
    );
    this.colorStates = new Map();
    this.palette = new Palette();
  }

  getCell({ x, y }) {
    return this.palette.getColor(this.grid[y][x]);
  }

  getCellCode({ x, y }) {
    return this.grid[y][x];
  }

  setCell({ x, y }, color) {
    this.grid[y][x] = this.palette.getColorCode(color);
  }

  setCellCode({ x, y }, colorCode) {
    this.grid[y][x] = colorCode;
  }

  isEmpty({ x, y }) {
    const color = this.getCellCode({ x, y });
    return !this.colorStates.get(color);
  }

  setEmpty({ x, y }) {
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

  addVector(v1, v2) {
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

    counts.forEach((count, color) => {
      this.colorStates.set(color, color !== mostCommonColor);
    });
  }

  forEach(callback) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        callback({ x, y, color: this.grid[y][x] });
      }
    }
  }

  toJSON() {
    return {
      gridSize: this.gridSize,
      grid: this.grid.map((row) => row.join("")),
      palette: this.palette.toJSON(),
      colorStates: Array.from(this.colorStates.entries()),
    };
  }

  static fromJSON(json) {
    const grid = new Grid(json.gridSize);
    grid.grid = json.grid.map((row) => row.split(""));
    grid.palette = new Palette();
    grid.palette = Palette.fromJSON(json.palette);
    grid.colorStates = new Map(json.colorStates);
    return grid;
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
