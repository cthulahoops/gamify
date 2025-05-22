import { useCallback, useState, useEffect } from "react";
import { Grid } from "./grid";
import { rgbToHex } from "./colors.js";

import type { GameState } from "./types";
import type { Point } from "./types";
import type { Color } from "./palette";
import type { Creation } from "./usePondiverse";
import { Aliases } from "./aliases";

const GRID_SIZE = 60;

const DEFAULT_RULES = [
  { match: "#> ", become: " #>" },
  { match: "> ", become: " >" },
  { match: "># ", become: " >#" },
  { match: ">## ", become: " >##" },
];

export function useGameState(creation: Creation | null) {
  const [gameState, setGameState] = useState<GameState | null>();

  useEffect(() => {
    if (!creation) {
      return;
    }
    const newState = loadCreation(creation);
    setGameState(newState);
  }, [creation]);

  const aliases = gameState?.aliases;
  const setAliases = useCallback(
    (newAliases: Aliases) => {
      setGameState((prev: GameState | null | undefined) => {
        if (!prev) {
          throw new Error("Game state is not initialized");
        }
        return { ...prev, aliases: newAliases };
      });
    },
    [setGameState],
  );

  return {
    gameState,
    setGameState,
    aliases,
    setAliases,
  };
}

function loadCreation(creation: Creation): GameState {
  if (creation?.img instanceof HTMLImageElement) {
    const grid = extractGrid(creation.img);
    const aliases = grid.getInitialAliases();
    return {
      rules: DEFAULT_RULES,
      grid,
      player: findRandomEmpty(aliases, grid),
      aliases,
    };
  }

  const data = JSON.parse(creation.data);
  const grid = Grid.fromJSON(data.grid);
  const aliases = grid.getInitialAliases();
  return {
    grid: grid,
    player: data.player,
    rules: data.rules,
    aliases,
  };
}

function findRandomEmpty(aliases: Aliases, grid: Grid) {
  const emptyCells: Array<Point> = [];

  grid.forEach(({ x, y }: Point) => {
    if (grid.isEmpty(aliases, { x, y })) {
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
