import { useRef, useEffect } from "react";

import type { Grid } from "./grid";
import type { GameState, Player } from "./types";

type GameCanvasProps = {
  gameState: GameState | null;
};

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (!gameState?.grid) {
      return;
    }
    drawGrid(canvasRef.current, {
      grid: gameState.grid,
      player: gameState.player,
    });
  }, [gameState]);

  return <canvas ref={canvasRef} />;
}

const GRID_SIZE = 60;
const SQUARE_SIZE = 10;

function drawGrid(
  canvas: HTMLCanvasElement,
  { grid, player }: { grid: Grid; player: Player },
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = GRID_SIZE * SQUARE_SIZE;
  canvas.height = GRID_SIZE * SQUARE_SIZE;

  grid.forEach(({ x, y, color: colorCode }) => {
    const hexColor = grid.palette.code_to_color.get(colorCode)!;
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
