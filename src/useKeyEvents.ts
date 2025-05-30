import { useCallback, useEffect } from "react";
import { applyRules } from "./rules";

import type { GameState, Point } from "./types";

export function useKeyEvents({
  gameState,
  setGameState,
}: {
  gameState: GameState | null | undefined;
  setGameState: (gameState: GameState) => void;
}) {
  const handleEvent = useCallback(
    (event: KeyboardEvent) => {
      handleKeyDown(gameState, setGameState, event);
    },
    [gameState, setGameState],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEvent);

    return () => {
      window.removeEventListener("keydown", handleEvent);
    };
  }, [handleEvent]);

  return null;
}

function keyToDirection(key: string): Point | null {
  switch (key) {
    case "ArrowUp":
      return { x: 0, y: -1 };
    case "ArrowDown":
      return { x: 0, y: 1 };
    case "ArrowLeft":
      return { x: -1, y: 0 };
    case "ArrowRight":
      return { x: 1, y: 0 };
    default:
      return null;
  }
}

function handleKeyDown(
  state: GameState | null | undefined,
  updateState: (state: GameState) => void,
  e: KeyboardEvent,
) {
  if (!state) {
    return;
  }
  if (document.activeElement?.id === "rules") return;

  const direction = keyToDirection(e.key);
  if (!direction) {
    return;
  }

  e.preventDefault();

  if (!state.playState.currentGrid || !state.playState.playerPosition) {
    return;
  }

  const { player, grid } = applyRules(state, direction);

  updateState({
    ...state,
    playState: {
      ...state.playState,
      playerPosition: player,
      currentGrid: grid,
    },
  });
}
