import { useCallback } from "react";
import { AliasesDisplay } from "./AliasesDisplay";
import { RulesDisplay } from "./RulesDisplay";
import { RulesTextarea } from "./RulesTextArea";
import { PlayerSpawnPosition } from "./PlayerSpawnPosition";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Aliases } from "./aliases";
import type { Palette, ColorCode, Color } from "./palette";
import type { Rule, DragItem, AliasDragItem, RuleDragItem } from "./types";
import type { GameDesign } from "./types";

import { DeleteZone } from "./DeleteZone";

type EditorProps = {
  gameDesign: GameDesign;
  setGameDesign: (design: GameDesign) => void;
};

export function Editor({ gameDesign, setGameDesign }: EditorProps) {
  const palette = gameDesign.palette;
  const aliases = gameDesign.aliases;
  const rules = gameDesign.rules;

  const setRules = useCallback(
    (rules: Rule[]) => {
      setGameDesign({ ...gameDesign, rules });
    },
    [gameDesign, setGameDesign],
  );

  const setAliases = useCallback(
    (aliases: Aliases) => {
      setGameDesign({ ...gameDesign, aliases });
    },
    [gameDesign, setGameDesign],
  );

  const setPalette = useCallback(
    (palette: Palette) => {
      setGameDesign({ ...gameDesign, palette });
    },
    [gameDesign, setGameDesign],
  );

  const onPaletteChange = useCallback(
    (colorCode: ColorCode, color: Color) => {
      const palette = gameDesign.palette;
      if (!palette) {
        throw new Error("Palette is not initialized");
      }
      palette.setColorCode(colorCode, color);
      setPalette(palette);
    },
    [gameDesign, setPalette],
  );

  const setPlayerSpawnPosition = useCallback(
    (position: { x: number; y: number }) => {
      setGameDesign({
        ...gameDesign,
        playerSpawnPosition: position,
      });
    },
    [gameDesign, setGameDesign],
  );

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
    const newAliases = aliases.clone();

    if (sourceIndex < 0) {
      // This is adding the alias itself to the target alias.
      newAliases.addToAlias(targetAlias, sourceAlias, targetIndex);
    } else {
      const symbolToMove = newAliases.removeFromAlias(sourceAlias, sourceIndex);
      if (!symbolToMove) {
        return;
      }
      newAliases.addToAlias(targetAlias, symbolToMove, targetIndex);
    }

    setAliases(newAliases);
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
    const newAliases = aliases.clone();
    newAliases.addAlias(undefined, symbol);

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

  const handleCreateNewRule = (sourceInfo?: AliasDragItem | RuleDragItem) => {
    const newRules = [...rules];

    // Create new rule with the symbol after the ">" in match
    const newRule = {
      match: ">" + sourceInfo?.symbol,
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

  const handleDeleteRuleBlock = (
    ruleIndex: number,
    side: "match" | "become",
    position: number,
  ) => {
    const newRules = [...rules];
    const rule = newRules[ruleIndex];
    const newSideString =
      rule[side].slice(0, position) + rule[side].slice(position + 1);
    newRules[ruleIndex] = { ...rule, [side]: newSideString };
    setRules(newRules);
  };

  const handleDeleteRule = (ruleIndex: number) => {
    const newRules = [...rules];
    newRules.splice(ruleIndex, 1);
    setRules(newRules);
  };

  const handleDeleteAliasBlock = (sourceAlias: string, sourceIndex: number) => {
    const newAliases = aliases.clone();
    newAliases.removeFromAlias(sourceAlias, sourceIndex);
    setAliases(newAliases);
  };

  const handleDelete = (item: DragItem) => {
    if (item.type === "RULE_BLOCK") {
      handleDeleteRuleBlock(
        item.sourceRuleIndex,
        item.sourceSide,
        item.sourcePosition,
      );
    } else if (item.type === "RULE_REORDER") {
      handleDeleteRule(item.sourceRuleIndex);
    } else if (item.type === "ALIAS_BLOCK") {
      handleDeleteAliasBlock(item.sourceAlias, item.sourceIndex);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor">
        <div className="editor-visual">
          <div className="editor-section">
            <PlayerSpawnPosition
              grid={gameDesign.originalGrid}
              aliases={aliases}
              position={gameDesign.playerSpawnPosition}
              setPosition={setPlayerSpawnPosition}
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

          <div className="editor-section">
            <h3>Palette</h3>
            <AliasesDisplay
              aliases={aliases}
              palette={palette}
              onMoveBlock={handleMoveBlock}
              onCreateNewAlias={handleCreateNewAlias}
              setColor={onPaletteChange}
            />
          </div>

          <DeleteZone onDelete={handleDelete} />
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
