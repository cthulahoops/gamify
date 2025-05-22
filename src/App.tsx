import "./App.css";
import "./style.css";

import { useEffect, useCallback } from "react";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { ColorControls } from "./ColorControls";
import { RulesTextarea } from "./RulesTextArea";
import { RulesDisplay } from "./RulesDisplay";

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

  return (
    <>
      <GameCanvas gameState={gameState} />
      <button id="reset">Reset</button>
      <div>Solid colours:</div>
      <ColorControls gameState={gameState} />
      <div id="color-controls"></div>
      <input type="color" id="color-picker" />
      <RulesDisplay rules={gameState.rules} palette={gameState.grid.palette} />
      <br />
      <RulesTextarea gameState={gameState} setRules={setRules} />
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
