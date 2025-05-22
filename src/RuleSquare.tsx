import type { Color, ColorCode, Palette } from "./palette";
import { getForegroundColor } from "./colors";

type RuleSquareProps = {
  palette: Palette;
  symbol: string;
};

const SYMBOL_DISPLAY_COLORS: Record<string, Color> = {
  "#": "#373737" as Color,
  ">": "#FF0000" as Color,
  "?": "#FFD200" as Color,
  " ": "#E4E4E4" as Color,
};

export function RuleSquare({ palette, symbol }: RuleSquareProps) {
  const color = getSymbolColor(symbol, palette);
  const textColor = getForegroundColor(color);
  return (
    <div
      className="rule-square"
      style={{
        backgroundColor: getSymbolColor(symbol, palette),
        color: textColor,
      }}
    >
      {symbol}
    </div>
  );
}

function getSymbolColor(sym: string, palette?: Palette): Color {
  return (
    palette?.getColor(sym as ColorCode) ||
    SYMBOL_DISPLAY_COLORS[sym] ||
    ("#7F7F7F" as Color)
  );
}
