import { useCallback } from "react";
import { AliasesDisplay } from "./AliasesDisplay";
import { RulesDisplay } from "./RulesDisplay";
import { RulesTextarea } from "./RulesTextArea";
import { PlayerSpawnPosition } from "./PlayerSpawnPosition";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Aliases } from "./aliases";
import type { Palette, ColorCode, Color } from "./palette";
import type {
  Rule,
  DragItem,
  AliasBlockDragItem,
  RuleBlockDragItem,
  BlockDragItem,
} from "./types";
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

  const handleAddBlockToRule = (
    sourceItem: BlockDragItem,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => {
    const newRules = [...rules];
    const targetRule = newRules[targetRuleIndex];
    const targetString = targetRule[targetSide];

    let adjustedTargetPosition = targetPosition;
    let symbolToAdd = sourceItem.symbol;

    // If it's a rule block, we need to remove it from the source
    if (sourceItem.type === "RULE_BLOCK") {
      const sourceRule = newRules[sourceItem.sourceRuleIndex];
      const sourceString = sourceRule[sourceItem.sourceSide];

      // If moving within the same rule side, adjust target position for removal
      if (sourceItem.sourceRuleIndex === targetRuleIndex && sourceItem.sourceSide === targetSide) {
        if (sourceItem.sourcePosition < adjustedTargetPosition) {
          adjustedTargetPosition--;
        }
      }

      // Remove from source
      const newSourceString =
        sourceString.slice(0, sourceItem.sourcePosition) +
        sourceString.slice(sourceItem.sourcePosition + 1);
      newRules[sourceItem.sourceRuleIndex] = {
        ...sourceRule,
        [sourceItem.sourceSide as keyof Rule]: newSourceString,
      };
    }

    // Add to target
    const newTargetString =
      targetString.slice(0, adjustedTargetPosition) +
      symbolToAdd +
      targetString.slice(adjustedTargetPosition);
    newRules[targetRuleIndex] = {
      ...targetRule,
      [targetSide as keyof Rule]: newTargetString,
    };

    setRules(newRules);
  };

  const handleAddBlockToAlias = (
    item: AliasBlockDragItem,
    targetAlias: string,
  ) => {
    if (item.sourceAlias === targetAlias) {
      return;
    }

    const newAliases = aliases.clone();

    if (item.sourceIndex < 0) {
      // This is adding the alias itself to the target alias.
      newAliases.addToAlias(targetAlias, item.sourceAlias);
    } else {
      const symbolToMove = newAliases.removeFromAlias(
        item.sourceAlias,
        item.sourceIndex,
      );
      if (!symbolToMove) {
        return;
      }
      newAliases.addToAlias(targetAlias, symbolToMove);
    }

    setAliases(newAliases);
  };

  const handleCreateNewAlias = (item: BlockDragItem) => {
    const newAliases = aliases.clone();
    newAliases.addAlias(undefined, item.symbol);

    // If it's a rule block, remove it from its original position in rules
    if (item.type === "RULE_BLOCK") {
      const newRules = [...rules];
      const sourceRule = newRules[item.sourceRuleIndex];
      const sourceString = sourceRule[item.sourceSide];
      const newSourceString =
        sourceString.slice(0, item.sourcePosition) +
        sourceString.slice(item.sourcePosition + 1);

      newRules[item.sourceRuleIndex] = {
        ...sourceRule,
        [item.sourceSide as keyof Rule]: newSourceString,
      };

      setRules(newRules);
    }

    setAliases(newAliases);
  };

  const handleCreateNewRule = (
    sourceInfo?: AliasBlockDragItem | RuleBlockDragItem,
  ) => {
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
              onAddBlockToRule={handleAddBlockToRule}
              onCreateNewRule={handleCreateNewRule}
              onReorderRule={handleReorderRule}
            />
          </div>

          <div className="editor-section">
            <h3>Palette</h3>
            <AliasesDisplay
              aliases={aliases}
              palette={palette}
              onAddBlockToAlias={handleAddBlockToAlias}
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
