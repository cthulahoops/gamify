import { PaletteDisplay } from "./PaletteDisplay";
import { AliasesDisplay } from "./AliasesDisplay";
import { RulesDisplay } from "./RulesDisplay";
import { RulesTextarea } from "./RulesTextArea";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Aliases } from "./aliases";
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
  const handleMoveRuleBlock = (
    sourceRuleIndex: number,
    sourceSide: "match" | "become",
    sourcePosition: number,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition?: number,
  ) => {
    const newRules = [...rules];

    const sourceRule = newRules[sourceRuleIndex];
    const targetRule = newRules[targetRuleIndex];

    const sourceString = sourceRule[sourceSide];
    const symbolToMove = sourceString[sourcePosition];

    let adjustedTargetPosition =
      targetPosition ?? targetRule[targetSide].length;

    // If moving within the same rule side, adjust target position for removal
    if (sourceRuleIndex === targetRuleIndex && sourceSide === targetSide) {
      if (sourcePosition < adjustedTargetPosition) {
        adjustedTargetPosition--;
      }
    }

    const newSourceString =
      sourceString.slice(0, sourcePosition) +
      sourceString.slice(sourcePosition + 1);
    newRules[sourceRuleIndex] = {
      ...sourceRule,
      [sourceSide]: newSourceString,
    };

    const targetString = newRules[targetRuleIndex][targetSide];
    const newTargetString =
      targetString.slice(0, adjustedTargetPosition) +
      symbolToMove +
      targetString.slice(adjustedTargetPosition);
    newRules[targetRuleIndex] = {
      ...newRules[targetRuleIndex],
      [targetSide]: newTargetString,
    };

    setRules(newRules);
  };

  const handleCopyAliasToRule = (
    symbol: string,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => {
    const newRules = [...rules];
    const targetRule = newRules[targetRuleIndex];
    const targetString = targetRule[targetSide];

    const newTargetString =
      targetString.slice(0, targetPosition) +
      symbol +
      targetString.slice(targetPosition);

    newRules[targetRuleIndex] = {
      ...targetRule,
      [targetSide]: newTargetString,
    };

    setRules(newRules);
  };

  const handleMoveBlock = (
    sourceAlias: string,
    sourceIndex: number,
    targetAlias: string,
    targetIndex?: number,
  ) => {
    const newAliases = new Aliases();
    for (const [alias, codes] of aliases.aliases.entries()) {
      newAliases.aliases.set(alias, [...codes]);
    }

    const sourceCodes = newAliases.aliases.get(sourceAlias);
    if (!sourceCodes || sourceIndex >= sourceCodes.length) return;

    const symbolToMove = sourceCodes[sourceIndex];

    newAliases.removeFromAlias(sourceAlias, sourceIndex);
    newAliases.addToAlias(targetAlias, symbolToMove, targetIndex);

    setAliases(newAliases);
  };

  const generateUniqueAliasName = (aliases: Aliases): string => {
    let charCode = 36; // Start with "$" (ASCII 36)
    while (true) {
      const candidate = String.fromCharCode(charCode);
      if (!aliases.aliases.has(candidate)) {
        return candidate;
      }
      charCode++;
    }
  };

  const handleCreateNewAlias = (
    symbol: string,
    sourceInfo?: {
      type: "RULE_BLOCK" | "ALIAS_BLOCK";
      sourceRuleIndex?: number;
      sourceSide?: "match" | "become";
      sourcePosition?: number;
      sourceAlias?: string;
      sourceIndex?: number;
    },
  ) => {
    const newAliases = new Aliases();
    for (const [alias, codes] of aliases.aliases.entries()) {
      newAliases.aliases.set(alias, [...codes]);
    }

    const newAliasName = generateUniqueAliasName(newAliases);
    newAliases.addAlias(newAliasName, symbol);

    // If it's a rule block, remove it from its original position in rules
    if (
      sourceInfo?.type === "RULE_BLOCK" &&
      sourceInfo.sourceRuleIndex !== undefined
    ) {
      const newRules = [...rules];
      const sourceRule = newRules[sourceInfo.sourceRuleIndex];
      const sourceString = sourceRule[sourceInfo.sourceSide!];
      const newSourceString =
        sourceString.slice(0, sourceInfo.sourcePosition!) +
        sourceString.slice(sourceInfo.sourcePosition! + 1);

      newRules[sourceInfo.sourceRuleIndex] = {
        ...sourceRule,
        [sourceInfo.sourceSide!]: newSourceString,
      };

      setRules(newRules);
    }

    setAliases(newAliases);
  };

  const handleCreateNewRule = (
    symbol: string,
    sourceInfo?: {
      type: "RULE_BLOCK" | "ALIAS_BLOCK";
      sourceRuleIndex?: number;
      sourceSide?: "match" | "become";
      sourcePosition?: number;
    },
  ) => {
    const newRules = [...rules];

    // Create new rule with the symbol after the ">" in match
    const newRule = {
      match: ">" + symbol,
      become: ">",
    };

    newRules.push(newRule);

    // If it's a rule block, remove it from its original position
    if (
      sourceInfo?.type === "RULE_BLOCK" &&
      sourceInfo.sourceRuleIndex !== undefined
    ) {
      const sourceRule = newRules[sourceInfo.sourceRuleIndex];
      const sourceString = sourceRule[sourceInfo.sourceSide!];
      const newSourceString =
        sourceString.slice(0, sourceInfo.sourcePosition!) +
        sourceString.slice(sourceInfo.sourcePosition! + 1);

      newRules[sourceInfo.sourceRuleIndex] = {
        ...sourceRule,
        [sourceInfo.sourceSide!]: newSourceString,
      };
    }

    setRules(newRules);
  };

  const handleReorderRule = (sourceIndex: number, targetIndex: number) => {
    const newRules = [...rules];
    const [movedRule] = newRules.splice(sourceIndex, 1);
    newRules.splice(targetIndex, 0, movedRule);
    setRules(newRules);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor">
        <div className="editor-visual">
          <div className="editor-section">
            <h3>Colors</h3>
            <PaletteDisplay palette={palette} onChange={onPaletteChange} />
          </div>

          <div className="editor-section">
            <h3>Aliases</h3>
            <AliasesDisplay
              aliases={aliases}
              palette={palette}
              onMoveBlock={handleMoveBlock}
              onCreateNewAlias={handleCreateNewAlias}
            />
          </div>

          <div className="editor-section">
            <h3>Rules</h3>
            <RulesDisplay
              rules={rules}
              aliases={aliases}
              palette={palette}
              onMoveRuleBlock={handleMoveRuleBlock}
              onCopyAliasToRule={handleCopyAliasToRule}
              onCreateNewRule={handleCreateNewRule}
              onReorderRule={handleReorderRule}
            />
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
    </DndProvider>
  );
}
