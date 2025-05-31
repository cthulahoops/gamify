import { useCallback } from "react";
import { PaletteDisplay } from "./PaletteDisplay";
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
  RuleLocation,
} from "./types";
import type { GameDesign, GameState } from "./types";

import { generateRandomColor } from "./colors";
import { DeleteZone } from "./DeleteZone";

type EditorProps = {
  gameDesign: GameDesign;
  setGameDesign: (design: GameDesign) => void;
  gameState: GameState;
};

export function Editor({ gameDesign, setGameDesign, gameState }: EditorProps) {
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

  const handleAddBlockToRule = (item: BlockDragItem, target: RuleLocation) => {
    let newRules = [...rules];
    let adjustedTargetPosition = target.position;
    const symbolToAdd = item.symbol;

    // If it's a rule block, we need to remove it from the source
    if (item.type === "RULE_BLOCK") {
      // If moving within the same rule side, adjust target position for removal
      if (
        item.source.ruleIndex === target.ruleIndex &&
        item.source.side === target.side
      ) {
        if (item.source.position < adjustedTargetPosition) {
          adjustedTargetPosition--;
        }
      }

      // Remove from source
      newRules = removeBlockFromRules(newRules, item.source);
    }

    const targetRule = newRules[target.ruleIndex];
    const targetString = targetRule[target.side];

    // Add to target
    const newTargetString =
      targetString.slice(0, adjustedTargetPosition) +
      symbolToAdd +
      targetString.slice(adjustedTargetPosition);
    newRules[target.ruleIndex] = {
      ...targetRule,
      [target.side as keyof Rule]: newTargetString,
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
      const newRules = removeBlockFromRules([...rules], item.source);

      setRules(newRules);
    }

    setAliases(newAliases);
  };

  const handleCreateNewRule = (
    item: AliasBlockDragItem | RuleBlockDragItem,
  ) => {
    let newRules = [...rules];

    const newRule = {
      match: ">" + item.symbol,
      become: ">",
    };

    newRules.push(newRule);

    if (item.type === "RULE_BLOCK" && item.source.ruleIndex !== undefined) {
      newRules = removeBlockFromRules(newRules, item.source);
    }

    setRules(newRules);
  };

  const handleReorderRule = (sourceIndex: number, targetIndex: number) => {
    const newRules = [...rules];
    const [movedRule] = newRules.splice(sourceIndex, 1);
    newRules.splice(targetIndex, 0, movedRule);
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
      setRules(removeBlockFromRules(rules, item.source));
    } else if (item.type === "RULE_REORDER") {
      handleDeleteRule(item.sourceRuleIndex);
    } else if (item.type === "ALIAS_BLOCK") {
      handleDeleteAliasBlock(item.sourceAlias, item.sourceIndex);
    }
  };

  const handleSaveGrid = useCallback(() => {
    setGameDesign({
      ...gameDesign,
      originalGrid: gameState.playState.currentGrid.clone(),
    });
  }, [gameDesign, setGameDesign, gameState]);

  const handleSavePlayerPosition = useCallback(() => {
    if (gameState.playState.playerPosition) {
      setGameDesign({
        ...gameDesign,
        playerSpawnPosition: gameState.playState.playerPosition,
      });
    }
  }, [gameDesign, setGameDesign, gameState]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor">
        <div className="editor-visual">
          <div className="editor-section">
            <button onClick={handleSaveGrid}>Save Grid</button>
            <button onClick={handleSavePlayerPosition}>Save Player Position</button>
          </div>
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
            <PaletteDisplay
              aliases={aliases}
              palette={palette}
              onAddBlockToAlias={handleAddBlockToAlias}
              onCreateNewAlias={handleCreateNewAlias}
              setColor={onPaletteChange}
              onAddColor={() => {
                const randomColor = generateRandomColor();
                palette.getColorCode(randomColor);
                setPalette(palette);
              }}
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

function removeBlockFromRules(rules: Rule[], source: RuleLocation): Rule[] {
  const sourceRule = rules[source.ruleIndex];
  const sourceString = sourceRule[source.side];
  const newSourceString =
    sourceString.slice(0, source.position) +
    sourceString.slice(source.position + 1);

  const newRules = [...rules];
  newRules[source.ruleIndex] = {
    ...sourceRule,
    [source.side as keyof Rule]: newSourceString,
  };

  return newRules;
}
