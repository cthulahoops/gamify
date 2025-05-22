import type { GameState } from "./types";
import type { ColorCode, Color } from "./palette";

export function ColorControls({ gameState }: { gameState: GameState }) {
  const { grid } = gameState;
  if (!grid?.palette) {
    return null;
  }

  return (
    <div id="color-controls">
      {Array.from(grid.palette.code_to_color.entries()).map(
        (entry: [ColorCode, Color]) => {
          const [code, color] = entry;
          return (
            <label className="color-label" key={code}>
              <input type="checkbox" />
              <Swatch color={color}>{code}</Swatch>
            </label>
          );
        },
      )}
    </div>
  );
}

function Swatch({
  color,
  children,
}: {
  color: Color;
  children: React.ReactNode;
}) {
  return (
    <span
      className="color-swatch"
      style={{
        backgroundColor: color,
      }}
    >
      {children}
    </span>
  );
}
