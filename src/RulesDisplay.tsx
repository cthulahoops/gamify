import React from "react";

import type { Rule } from "./types";
import type { Palette } from "./palette";
import type { Aliases } from "./aliases";
import { RuleSquare } from "./RuleSquare";

type RulesDisplayProps = {
  rules: Rule[];
  aliases: Aliases;
  palette: Palette;
};

export function RulesDisplay({ rules, aliases, palette }: RulesDisplayProps) {
  return (
    <div id="rules-graphical">
      {rules.map((rule, idx) => (
        <React.Fragment key={idx}>
          <div className="rules-side">
            {Array.from(rule.match).map((ch, i) => (
              <RuleSquare
                key={i}
                palette={palette}
                aliases={aliases}
                symbol={ch}
              />
            ))}
          </div>
          <div className="rule-arrow">→</div>
          <div className="rules-side">
            {Array.from(rule.become).map((ch, i) => (
              <RuleSquare
                key={i}
                palette={palette}
                aliases={aliases}
                symbol={ch}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
