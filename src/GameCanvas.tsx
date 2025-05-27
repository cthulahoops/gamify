import { useRef, useEffect } from "react";

import type { Grid } from "./grid";
import type { GameState, Player } from "./types";
import type { Palette } from "./palette";

type GameCanvasProps = {
  gameState: GameState | null;
  ref?: React.RefObject<HTMLCanvasElement | null>;
};

export function GameCanvas({ gameState, ref: passedRef }: GameCanvasProps) {
  const defaultCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = passedRef ?? defaultCanvasRef;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (!gameState?.playState?.currentGrid) {
      return;
    }
    drawGrid(canvasRef.current, {
      grid: gameState.playState.currentGrid,
      player: gameState.playState.playerPosition,
      palette: gameState.design.palette,
    });
  }, [gameState, canvasRef]);

  return <canvas ref={canvasRef} />;
}

const GRID_SIZE = 60;
const SQUARE_SIZE = 10;

function drawGrid(
  canvas: HTMLCanvasElement,
  { grid, player, palette }: { grid: Grid; player: Player; palette: Palette },
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = GRID_SIZE * SQUARE_SIZE;
  canvas.height = GRID_SIZE * SQUARE_SIZE;

  grid.forEach(({ x, y, color: colorCode }) => {
    const hexColor = palette.code_to_color.get(colorCode)!;
    ctx.fillStyle = hexColor;
    ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
  });

  drawPlayer(ctx, player);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  if (!player) {
    return;
  }
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.arc(
    player.x * SQUARE_SIZE + SQUARE_SIZE / 2,
    player.y * SQUARE_SIZE + SQUARE_SIZE / 2,
    SQUARE_SIZE / 2.5,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}
