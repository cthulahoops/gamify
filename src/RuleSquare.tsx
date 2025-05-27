import type { Palette } from "./palette";
import type { Aliases } from "./aliases";
import { getForegroundColor } from "./colors";

import type { Color } from "./palette";

type RuleSquareProps = {
  aliases: Aliases;
  palette: Palette;
  symbol: string;
};

export function RuleSquare({ aliases, palette, symbol }: RuleSquareProps) {
  const backgroundColor = getSymbolColor(symbol, palette, aliases);
  const textColor = getForegroundColor(backgroundColor as Color);

  return (
    <div
      className="rule-square"
      style={{
        background: backgroundColor,
        color: textColor,
      }}
    >
      {symbol}
    </div>
  );
}

function getSymbolColor(
  sym: string,
  palette: Palette,
  aliases: Aliases,
): string {
  if (sym === ">") {
    return "#ff0000";
  }

  if (palette.hasColorCode(sym)) {
    return palette.getColor(sym);
  }

  const colors = aliases.expand(sym).map((code) => palette.getColor(code));
  return gradient(colors);
}

function gradient(colors: string[]) {
  return `conic-gradient(${colors.join(", ")})`;
}
