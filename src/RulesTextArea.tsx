import { useState, useEffect } from "react";
import type { Rule } from "./types";
import { Aliases } from "./aliases";
import { Palette } from "./palette";

type RulesTextareaProps = {
  rules: Rule[];
  aliases: Aliases;
  setRules: (rules: Rule[]) => void;
  setAliases: (aliases: Aliases) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
};

export function RulesTextarea({
  rules,
  setRules,
  aliases,
  setAliases,
  palette,
  setPalette,
}: RulesTextareaProps) {
  const [rulesText, setRulesText] = useState(
    JSON.stringify(
      { aliases: aliases.toJSON(), rules, palette: palette.toJSON() },
      null,
      2,
    ),
  );
  const [rulesErrors, setRulesErrors] = useState("");

  // Sync text when external state changes (from drag-and-drop operations)
  useEffect(() => {
    const newText = JSON.stringify(
      { aliases: aliases.toJSON(), rules, palette: palette.toJSON() },
      null,
      2,
    );
    setRulesText(newText);
  }, [rules, aliases, palette]);

  const onChange = (text: string) => {
    setRulesText(text);
    try {
      const {
        rules: newRules,
        aliases: newAliases,
        palette: newPalette,
      } = JSON.parse(text);
      setRulesErrors("");
      setRules(newRules);
      setPalette(Palette.fromJSON(newPalette));
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
