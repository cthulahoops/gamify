import "./App.css";
import "./style.css";

import { useEffect, useCallback } from "react";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { RulesTextarea } from "./RulesTextArea";
import { RulesDisplay } from "./RulesDisplay";
import { AliasesDisplay } from "./AliasesDisplay";

import type { Rule, GameState } from "./types";

export default function App() {
  const { gameState, setGameState, setCreation } = useGameState();

  const { creation } = usePondiverse(
    "https://pondiverse.val.run/get-creation?id=532",
  );

  useEffect(() => {
    if (creation === null) {
      return;
    }

    setCreation(creation);
  }, [creation, setCreation]);

  const setRules = useCallback(
    (rules: Rule[]) => {
      setGameState((prev: GameState) => {
        return { ...prev, rules };
      });
    },
    [setGameState],
  );

  useKeyEvents({ gameState, setGameState });

  if (!gameState.grid) {
    return "Loading...";
  }

  const rules = gameState.rules;
  const aliases = gameState.grid.aliases;
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
      <RulesTextarea rules={rules} setRules={setRules} />
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
