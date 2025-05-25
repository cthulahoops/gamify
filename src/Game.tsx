import { useCallback } from "react";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { RulesTextarea } from "./RulesTextArea";
import { RulesDisplay } from "./RulesDisplay";
import { AliasesDisplay } from "./AliasesDisplay";

import type { Rule, GameState } from "./types";

type GameProps = {
  creationUrl: string;
};

export function Game({ creationUrl }: GameProps) {
  const { creation } = usePondiverse(creationUrl);
  const { gameState, setGameState, setAliases } = useGameState(creation);

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

  useKeyEvents({ gameState, setGameState });

  if (!gameState) {
    return "Loading...";
  }

  const aliases = gameState.aliases;
  const rules = gameState.rules;
  const palette = gameState.grid.palette;

  return (
    <>
      <GameCanvas gameState={gameState} />
      <button id="reset">Reset</button>
      <div>Solid colours:</div>
      <input type="color" id="color-picker" />
      <AliasesDisplay aliases={aliases} palette={palette} />
      <RulesDisplay rules={rules} palette={palette} />
      <br />
      <RulesTextarea
        aliases={aliases}
        rules={rules}
        setRules={setRules}
        setAliases={setAliases}
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
