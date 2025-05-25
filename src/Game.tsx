import { useCallback } from "react";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { RulesTextarea } from "./RulesTextArea";
import { RulesDisplay } from "./RulesDisplay";
import { AliasesDisplay } from "./AliasesDisplay";
import { PaletteDisplay } from "./PaletteDisplay";

import type { Color, ColorCode } from "./palette";

import type { Rule, GameState } from "./types";

type GameProps = {
  creationUrl: string;
};

export function Game({ creationUrl }: GameProps) {
  const { creation } = usePondiverse(creationUrl);
  const { gameState, setGameState, setAliases, setPalette } =
    useGameState(creation);

  const setRules = useCallback(
    (rules: Rule[]) => {
      setGameState((prev: GameState | null | undefined) => {
        if (!prev) {
          throw new Error("Game state is not initialized");
        }
        return { ...prev, rules };
      });
    },
    [setGameState],
  );

  const onPaletteChange = useCallback(
    (colorCode: ColorCode, color: Color) => {
      const palette = gameState?.palette;
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

  const palette = gameState.palette;
  const aliases = gameState.aliases;
  const rules = gameState.rules;

  return (
    <>
      <GameCanvas gameState={gameState} />
      <button id="reset">Reset</button>
      <PaletteDisplay palette={palette} onChange={onPaletteChange} />
      <AliasesDisplay aliases={aliases} palette={palette} />
      <RulesDisplay rules={rules} palette={palette} />
      <br />
      <RulesTextarea
        aliases={aliases}
        rules={rules}
        setRules={setRules}
        setAliases={setAliases}
        palette={palette}
        setPalette={setPalette}
      />
      <a href="" id="original">
        View Original
      </a>
      <p>
        Use arrow keys to move the red player.
        <br />
        Add <code>?creation=YOUR_ID</code> to the URL to play on a Pondiverse
        grid.
      </p>
    </>
  );
}
