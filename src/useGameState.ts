import { useState, useCallback } from "react";
import { Grid } from "./grid";
import { rgbToHex } from "./colors.js";

import type { GameState } from "./types";
import type { Point } from "./types";
import type { Color } from "./palette";
import type { Creation } from "./usePondiverse";

const GRID_SIZE = 60;

const DEFAULT_GAME_STATE = {
  rules: [
    { match: "#> ", become: " #>" },
    { match: "> ", become: " >" },
    { match: "># ", become: " >#" },
    { match: ">## ", become: " >##" },
  ],
  colors: {
    properties: {
      solid: [],
      empty: [],
    },
    palette: {},
  },
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    rules: DEFAULT_GAME_STATE.rules,
    // colors: {
    //   properties: {
    //     solid: [],
    //     empty: [],
    //   },
    //   palette: {},
    // },
    grid: null,
    player: { x: 0, y: 0 },
  });

  const setCreation = useCallback((creation: Creation) => {
    setGameState((prevState) => loadCreation(creation, prevState));
  }, []);

  return {
    gameState,
    setGameState,
    setCreation,
  };
}

function loadCreation(creation: Creation, state: GameState): GameState {
  if (creation?.img instanceof HTMLImageElement) {
    const grid = extractGrid(creation.img);
    return {
      ...state,
      grid: grid,
      player: findRandomEmpty(grid),
    };
  }

  const data = JSON.parse(creation.data);
  state.grid = Grid.fromJSON(data.grid);
  state.player = data.player;
  state.rules = data.rules;
  return {
    ...state,
    grid: Grid.fromJSON(data.grid),
    player: data.player,
    rules: data.rules,
  };
}

function findRandomEmpty(grid: Grid) {
  const emptyCells: Array<Point> = [];

  grid.forEach(({ x, y }: Point) => {
    if (grid.isEmpty({ x, y })) {
      emptyCells.push({ x, y });
    }
  });

  if (emptyCells.length === 0) return null; // No empty cells found

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

function extractGrid(image: HTMLImageElement): Grid {
  const grid = new Grid(GRID_SIZE);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    throw new Error("Failed to get canvas context");
  }
  tempCtx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height).data;

  const cellWidth = Math.floor(image.width / grid.gridSize);
  const cellHeight = Math.floor(image.height / grid.gridSize);

  for (let y = 0; y < grid.gridSize; y++) {
    for (let x = 0; x < grid.gridSize; x++) {
      const color = getMostCommonColor(
        imageData,
        x * cellWidth,
        y * cellHeight,
        Math.min(cellWidth, cellHeight),
        image.width,
      );
      grid.setCell({ x, y }, color);
    }
  }

  grid.setupColorStates();
  return grid;
}

function getMostCommonColor(
  data: Uint8ClampedArray,
  x0: number,
  y0: number,
  size: number,
  width: number,
): Color {
  const colorCount = new Map<Color, number>();
  for (let y = y0; y < y0 + size; y++) {
    for (let x = x0; x < x0 + size; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const hexColor = rgbToHex({ r, g, b });
      colorCount.set(hexColor, (colorCount.get(hexColor) || 0) + 1);
    }
  }
  let max = 0;
  let maxColor = "#FFFFFF" as Color;

  for (const [hexColor, count] of colorCount.entries()) {
    if (count > max) {
      max = count;
      maxColor = hexColor;
    }
  }
  return maxColor;
}
