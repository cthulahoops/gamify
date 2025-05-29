import { useCallback, useState, useEffect } from "react";
import { Grid } from "./grid";
import { rgbToHex } from "./colors.js";

import type {
  GameState,
  GameDesign,
  GamePlayState,
  GameStateDTO,
} from "./types";
import type { Point } from "./types";
import type { Color } from "./palette";
import type { Creation } from "./usePondiverse";
import { Aliases } from "./aliases";
import { Palette, type ColorCode } from "./palette";
import { isSimilar } from "./colors";

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

  const aliases = gameState?.design.aliases;

  const resetGame = useCallback(() => {
    setGameState((prev: GameState | null | undefined) => {
      if (!prev) {
        throw new Error("Game state is not initialized");
      }
      return {
        ...prev,
        playState: {
          currentGrid: prev.design.originalGrid.clone(),
          playerPosition: prev.design.playerSpawnPosition,
        },
      };
    });
  }, [setGameState]);

  return {
    gameState,
    setGameState,
    aliases,
    resetGame,
  };
}

function loadCreation(creation: Creation): GameState {
  if (creation?.img instanceof HTMLImageElement) {
    const [grid, palette] = extractGrid(creation.img);
    const aliases = getInitialAliases(grid, palette);
    const playerSpawnPosition = findRandomEmpty(aliases, grid);

    const design: GameDesign = {
      originalGrid: grid,
      playerSpawnPosition,
      palette,
      aliases,
      rules: DEFAULT_RULES,
    };

    const playState: GamePlayState = {
      currentGrid: grid.clone(),
      playerPosition: playerSpawnPosition,
    };

    return { design, playState };
  }

  const data = JSON.parse(creation.data || "{}") as GameStateDTO;
  const grid = Grid.fromJSON(data.grid);
  const palette = Palette.fromJSON(data.palette);
  const aliases = getInitialAliases(grid, palette);

  const design: GameDesign = {
    originalGrid: grid,
    playerSpawnPosition: data.player,
    palette,
    aliases,
    rules: data.rules,
  };

  const playState: GamePlayState = {
    currentGrid: grid.clone(),
    playerPosition: data.player,
  };

  return { design, playState };
}

export function findRandomEmpty(aliases: Aliases, grid: Grid) {
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

export function extractGrid(image: HTMLImageElement): [Grid, Palette] {
  // Calculate grid dimensions respecting aspect ratio with 60 cells height
  const gridHeight = 60;
  const aspectRatio = image.width / image.height;
  const gridWidth = Math.round(gridHeight * aspectRatio);

  const grid = new Grid(gridWidth, gridHeight);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    throw new Error("Failed to get canvas context");
  }
  tempCtx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height).data;

  const palette = new Palette();

  const cellWidth = Math.floor(image.width / grid.width);
  const cellHeight = Math.floor(image.height / grid.height);

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const color = getMostCommonColor(
        imageData,
        x * cellWidth,
        y * cellHeight,
        Math.min(cellWidth, cellHeight),
        image.width,
      );
      const colorCode = palette.getColorCode(color);
      grid.setCellCode({ x, y }, colorCode);
    }
  }
  return [grid, palette];
}

export function getInitialAliases(grid: Grid, palette: Palette): Aliases {
  const defaultAliases = new Aliases();
  const counts = grid.countColors();
  const mostCommonColor = [...counts.entries()].reduce((a, b) =>
    a[1] > b[1] ? a : b,
  )[0];

  counts.forEach((_count, color: ColorCode) => {
    if (
      isSimilar(palette.getColor(color)!, palette.getColor(mostCommonColor)!)
    ) {
      defaultAliases.addAlias(" ", color);
    } else {
      defaultAliases.addAlias("#", color);
    }
  });
  return defaultAliases;
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
