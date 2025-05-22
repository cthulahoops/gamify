import React from "react";

import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
import { RuleSquare } from "./RuleSquare";

type AliasDisplayProps = {
  aliases: Aliases;
  palette: Palette;
};

export function AliasesDisplay({ aliases, palette }: AliasDisplayProps) {
  return (
    <div id="aliases-display">
      {Array.from(aliases.aliases.entries()).map(([alias, codes]) => (
        <React.Fragment key={alias}>
          <div className="rules-side">
            <RuleSquare palette={palette} symbol={alias} />
          </div>
          <div className="rule-arrow">=</div>
          <div className="rules-side">
            {codes.map((symbol, idx) => (
              <RuleSquare key={idx} palette={palette} symbol={symbol} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
