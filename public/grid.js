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

  addVector(v1, v2) {
    return {
      x: mod(v1.x + v2.x, this.gridSize),
      y: mod(v1.y + v2.y, this.gridSize),
    };
  }

  setupColorStates() {
    const uniqueColors = this.extractUniqueColors();
    uniqueColors.forEach((color) => {
      const key = color.join(",");
      this.colorStates.set(key, !isLight(color)); // Solid if not light
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

function isLight([r, g, b]) {
  return (r + g + b) / 3 > 200; // Average brightness threshold
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
