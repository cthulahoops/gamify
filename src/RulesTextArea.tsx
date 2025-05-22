import { useState } from "react";
import type { Rule } from "./types";

type RulesTextareaProps = {
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
};

export function RulesTextarea({ rules, setRules }: RulesTextareaProps) {
  const [rulesText, setRulesText] = useState(JSON.stringify(rules, null, 2));
  const [rulesErrors, setRulesErrors] = useState("");

  const onChange = (text: string) => {
    setRulesText(text);
    try {
      const newRules = JSON.parse(text);
      setRulesErrors("");
      setRules(newRules);
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
