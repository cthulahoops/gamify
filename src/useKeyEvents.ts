import { useCallback, useEffect } from "react";
import { applyRules } from "./rules";

import type { GameState, Point } from "./types";

export function useKeyEvents({
  gameState,
  setGameState,
}: {
  gameState: GameState;
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
  state: GameState,
  updateState: (state: GameState) => void,
  e: KeyboardEvent,
) {
  if (document.activeElement?.id === "rules") return;

  e.preventDefault();

  const direction = keyToDirection(e.key);
  if (!direction) {
    return;
  }

  if (!state.grid || !state.player) {
    return;
  }

  const { player, grid } = applyRules(
    state.rules,
    state.grid,
    state.player,
    direction,
  );

  updateState({
    ...state,
    player,
    grid,
  });
}
