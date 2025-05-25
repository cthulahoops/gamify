import "./App.css";
import "./style.css";

import { useMemo } from "react";
import { Game } from "./Game";

function useCreationUrl() {
  return useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("creation");
  }, []);
}

export default function App() {
  const creationUrl = useCreationUrl();
  if (!creationUrl) {
    return (
      <div>
        <h1>Pondiverse Game</h1>
        <p>
          Add <code>?creation=YOUR_ID</code> to the URL to play on a Pondiverse
          grid.
        </p>
      </div>
    );
  }
  return <Game creationUrl={creationUrl} />;
}
