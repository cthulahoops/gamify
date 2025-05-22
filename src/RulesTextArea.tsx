import { useState } from "react";
import type { Rule } from "./types";
import { Aliases } from "./aliases";

type RulesTextareaProps = {
  rules: Rule[];
  aliases: Aliases;
  setRules: (rules: Rule[]) => void;
  setAliases: (aliases: Aliases) => void;
};

export function RulesTextarea({
  rules,
  setRules,
  aliases,
  setAliases,
}: RulesTextareaProps) {
  const [rulesText, setRulesText] = useState(
    JSON.stringify({ aliases: aliases.toJSON(), rules }, null, 2),
  );
  const [rulesErrors, setRulesErrors] = useState("");

  const onChange = (text: string) => {
    setRulesText(text);
    try {
      const { rules: newRules, aliases: newAliases } = JSON.parse(text);
      setRulesErrors("");
      setRules(newRules);
      setAliases(Aliases.fromJSON(newAliases));
    } catch (error) {
      const errorMessage = (error as { message: string }).message;
      setRulesErrors(errorMessage);
      return;
    }
  };

  return (
    <>
      <textarea
        id="rules"
        rows={10}
        cols={50}
        value={rulesText}
        onChange={(e) => onChange(e.target.value)}
      />
      <div id="rules-errors">{rulesErrors}</div>
    </>
  );
}
