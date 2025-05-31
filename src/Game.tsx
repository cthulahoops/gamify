import { useCallback, useRef, useMemo } from "react";

import { PondiverseButton } from "./PondiverseButton";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { Editor } from "./Editor";

import type { GameState, GameStateDTO } from "./types";

type GameProps = {
  creationUrl?: string;
  localImage?: HTMLImageElement;
};

export function Game({ creationUrl, localImage }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { creation } = usePondiverse(creationUrl || "");

  // Create a creation object from local image if provided (memoized to prevent re-initialization)
  const localCreation = useMemo(
    () =>
      localImage
        ? {
            id: "local",
            type: "image",
            title: "Local Image",
            img: localImage,
            data: undefined,
          }
        : null,
    [localImage],
  );

  const { gameState, setGameState, resetGame } = useGameState(
    creation || localCreation,
  );

  const setGameDesign = useCallback(
    (design: GameState["design"]) => {
      setGameState((prev: GameState | null | undefined) => {
        if (!prev) {
          throw new Error("Game state is not initialized");
        }
        return { ...prev, design };
      });
    },
    [setGameState],
  );

  useKeyEvents({ gameState, setGameState });

  if (!gameState) {
    return "Loading...";
  }

  const pondiverseToolUrl =
    "https://pondiverse.com/tool?creation=" + creationUrl ? creationUrl : null;

  return (
    <>
      <main>
        <div className="game-container">
          <GameCanvas gameState={gameState} ref={canvasRef} />
          <button id="reset" onClick={resetGame}>
            Reset
          </button>
          <p>
            Use arrow keys to move the red player.
            <br />
            Add <code>?creation=YOUR_ID</code> to the URL to play on a
            Pondiverse grid.
          </p>
        </div>

        <Editor
          gameDesign={gameState.design}
          setGameDesign={setGameDesign}
          gameState={gameState}
        />
      </main>

      <footer className="game-footer">
        <a href="/">New Creation</a>
        {pondiverseToolUrl && (
          <a href={pondiverseToolUrl} target="_blank" rel="noopener noreferrer">
            View On Pondiverse Tool
          </a>
        )}
        <a
          href="https://github.com/cthulahoops/gamify"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source Code
        </a>
      </footer>

      <PondiverseButton
        getPondiverseCreation={() => {
          const gameStateSaved: GameStateDTO = {
            palette: gameState.design.palette.toJSON(),
            aliases: gameState.design.aliases.toJSON(),
            rules: gameState.design.rules,
            grid: gameState.design.originalGrid.toJSON(),
            player: gameState.design.playerSpawnPosition,
          };
          return {
            type: "gamified",
            data: JSON.stringify(gameStateSaved),
            image: canvasRef?.current?.toDataURL() ?? "",
          };
        }}
      />
    </>
  );
}
