import { useCallback, useRef, useMemo } from "react";

import { PondiverseButton } from "./PondiverseButton";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { Editor } from "./Editor";

import type { Color, ColorCode } from "./palette";

import type { Rule, GameState, GameStateDTO } from "./types";

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
      localImage ? { type: "image", img: localImage, data: undefined } : null,
    [localImage],
  );

  const { gameState, setGameState, setAliases, setPalette, resetGame } =
    useGameState(creation || localCreation);

  const setRules = useCallback(
    (rules: Rule[]) => {
      setGameState((prev: GameState | null | undefined) => {
        if (!prev) {
          throw new Error("Game state is not initialized");
        }
        return {
          ...prev,
          design: { ...prev.design, rules },
        };
      });
    },
    [setGameState],
  );

  const onPaletteChange = useCallback(
    (colorCode: ColorCode, color: Color) => {
      const palette = gameState?.design.palette;
      if (!palette) {
        throw new Error("Palette is not initialized");
      }
      palette.setColorCode(colorCode, color);
      setPalette(palette);
    },
    [setPalette, gameState],
  );

  useKeyEvents({ gameState, setGameState });

  if (!gameState) {
    return "Loading...";
  }

  const palette = gameState.design.palette;
  const aliases = gameState.design.aliases;
  const rules = gameState.design.rules;

  return (
    <>
      <GameCanvas gameState={gameState} ref={canvasRef} />
      <button id="reset" onClick={resetGame}>
        Reset
      </button>

      <Editor
        palette={palette}
        aliases={aliases}
        rules={rules}
        onPaletteChange={onPaletteChange}
        setRules={setRules}
        setAliases={setAliases}
        setPalette={setPalette}
      />

      <div className="game-footer">
        <a href="" id="original">
          View Original
        </a>
        <p>
          Use arrow keys to move the red player.
          <br />
          Add <code>?creation=YOUR_ID</code> to the URL to play on a Pondiverse
          grid.
        </p>
        <PondiverseButton
          getPondiverseCreation={() => {
            const gameStateSaved: GameStateDTO = {
              palette: gameState.design.palette.toJSON(),
              aliases: gameState.design.aliases.toJSON(),
              rules: gameState.design.rules,
              grid: gameState.design.originalGrid.toJSON(),
              player: gameState.design.playerSpawnPosition,
            };
            console.log("Saving game state:", gameStateSaved);
            return {
              type: "gamified",
              data: JSON.stringify(gameStateSaved),
              image: canvasRef?.current?.toDataURL() ?? "",
            };
          }}
        />
      </div>
    </>
  );
}
