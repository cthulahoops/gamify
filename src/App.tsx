import "./App.css";
import "./style.css";

import { useEffect } from "react";

import { useGameState } from "./useGameState";
import { useKeyEvents } from "./useKeyEvents";
import { usePondiverse } from "./usePondiverse";

import { GameCanvas } from "./GameCanvas";
import { ColorControls } from "./ColorControls";
import { RulesTextarea } from "./RulesTextArea";
import { RulesDisplay } from "./RulesDisplay";

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

  useKeyEvents({ gameState, setGameState });

  return (
    <>
      <GameCanvas gameState={gameState} />
      <button id="reset">Reset</button>
      <div>Solid colours:</div>
      <ColorControls gameState={gameState} />
      <div id="color-controls"></div>
      <input type="color" id="color-picker" />
      <RulesDisplay gameState={gameState} />
      <br />
      <RulesTextarea gameState={gameState} />
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
