import React from "react";

import type { Rule } from "./types";
import type { Palette } from "./palette";
import { RuleSquare } from "./RuleSquare";

type RulesDisplayProps = {
  rules: Rule[];
  palette: Palette;
  // setRules: (rules: Rule[]) => void;
};

export function RulesDisplay({ rules, palette }: RulesDisplayProps) {
  return (
    <div id="rules-graphical">
      {rules.map((rule, idx) => (
        <React.Fragment key={idx}>
          <div className="rules-side">
            {Array.from(rule.match).map((ch, i) => (
              <RuleSquare key={i} palette={palette} symbol={ch} />
            ))}
          </div>
          <div className="rule-arrow">→</div>
          <div className="rules-side">
            {Array.from(rule.become).map((ch, i) => (
              <RuleSquare key={i} palette={palette} symbol={ch} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
