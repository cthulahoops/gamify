export class Grid {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => [255, 255, 255]),
    );
    this.colorStates = new Map();
  }

  getCell({ x, y }) {
    return this.grid[y][x];
  }

  setCell({ x, y }, color) {
    this.grid[y][x] = color;
  }

  isEmpty({ x, y }) {
    const color = this.getCell({ x, y });
    const key = color.join(",");
    return !this.colorStates.get(key);
  }

  setEmpty({ x, y }) {
    for (const [color, isSolid] of this.colorStates.entries()) {
      if (!isSolid) {
        const colorArray = color.split(",").map(Number);
        this.setCell({ x, y }, colorArray);
        return;
      }
    }
  }

  extractUniqueColors() {
    const seen = new Set();
    const uniqueColors = [];
    this.forEach(({ x, y, color }) => {
      const key = color.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        uniqueColors.push(color);
      }
    });
    return uniqueColors;
  }

  countColors() {
    const colorCounts = new Map();
    this.forEach(({ color }) => {
      const key = color.join(",");
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
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
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
