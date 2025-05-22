import React from "react";

import type { Rule } from "./types";
import type { Palette, Color, ColorCode } from "./palette";

const SYMBOL_DISPLAY_COLORS: Record<string, Color> = {
  "#": "#373737" as Color,
  ">": "#FF0000" as Color,
  "?": "#FFD200" as Color,
  " ": "#E4E4E4" as Color,
};

type RulesDisplayProps = {
  rules: Rule[];
  palette: Palette;
  // setRules: (rules: Rule[]) => void;
};

function getSymbolColor(sym: string, palette?: Palette): Color {
  return (
    palette?.getColor(sym as ColorCode) ||
    SYMBOL_DISPLAY_COLORS[sym] ||
    ("#7F7F7F" as Color)
  );
}

export function RulesDisplay({ rules, palette }: RulesDisplayProps) {
  return (
    <div id="rules-graphical">
      {rules.map((rule, idx) => (
        <React.Fragment key={idx}>
          <div className="rules-side">
            {Array.from(rule.match).map((ch, i) => (
              <div
                key={i}
                className="rule-square"
                style={{
                  backgroundColor: getSymbolColor(ch, palette),
                  color: ch === " " ? "#333333" : "#FFFFFF",
                }}
              >
                {ch}
              </div>
            ))}
          </div>
          <div className="rule-arrow">→</div>
          <div className="rules-side">
            {Array.from(rule.become).map((ch, i) => (
              <div
                key={i}
                className="rule-square"
                style={{
                  backgroundColor: getSymbolColor(ch, palette),
                  color: ch === " " ? "#333333" : "#FFFFFF",
                }}
              >
                {ch}
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
