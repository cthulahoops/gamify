import { PaletteDisplay } from "./PaletteDisplay";
import { AliasesDisplay } from "./AliasesDisplay";
import { RulesDisplay } from "./RulesDisplay";
import { RulesTextarea } from "./RulesTextArea";

import type { Aliases } from "./aliases";
import type { Palette, ColorCode, Color } from "./palette";
import type { Rule } from "./types";

type EditorProps = {
  palette: Palette;
  aliases: Aliases;
  rules: Rule[];
  onPaletteChange: (colorCode: ColorCode, color: Color) => void;
  setRules: (rules: Rule[]) => void;
  setAliases: (aliases: Aliases) => void;
  setPalette: (palette: Palette) => void;
};

export function Editor({
  palette,
  aliases,
  rules,
  onPaletteChange,
  setRules,
  setAliases,
  setPalette,
}: EditorProps) {
  return (
    <div className="editor">
      <div className="editor-visual">
        <div className="editor-section">
          <h3>Colors</h3>
          <PaletteDisplay palette={palette} onChange={onPaletteChange} />
        </div>

        <div className="editor-section">
          <h3>Aliases</h3>
          <AliasesDisplay aliases={aliases} palette={palette} />
        </div>

        <div className="editor-section">
          <h3>Rules</h3>
          <RulesDisplay rules={rules} aliases={aliases} palette={palette} />
        </div>
      </div>

      <div className="editor-text">
        <h3>Rule Editor</h3>
        <RulesTextarea
          aliases={aliases}
          rules={rules}
          setRules={setRules}
          setAliases={setAliases}
          palette={palette}
          setPalette={setPalette}
        />
      </div>
    </div>
  );
}
