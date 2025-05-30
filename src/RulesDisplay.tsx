import React from "react";
import { useRef } from "react";
import { useDrop } from "react-dnd";

import type {
  Rule,
  DragItem,
  RuleDragItem,
  BlockDragItem,
  RuleLocation,
} from "./types";
import type { Palette } from "./palette";
import type { Aliases } from "./aliases";
import { RuleSquare } from "./RuleSquare";

import { Draggable } from "./Draggable";

type RulesDisplayProps = {
  rules: Rule[];
  aliases: Aliases;
  palette: Palette;
  onAddBlockToRule?: (sourceItem: BlockDragItem, target: RuleLocation) => void;
  onCreateNewRule: (item: BlockDragItem) => void;
  onReorderRule: (sourceIndex: number, targetIndex: number) => void;
};

export function RulesDisplay({
  rules,
  aliases,
  palette,
  onAddBlockToRule,
  onCreateNewRule,
  onReorderRule,
}: RulesDisplayProps) {
  return (
    <div>
      <div className="rule-list">
        <RuleDropZone targetRuleIndex={0} onReorderRule={onReorderRule} />

        {rules.map((rule, ruleIndex) => (
          <React.Fragment key={ruleIndex}>
            <Rule
              ruleIndex={ruleIndex}
              rule={rule}
              aliases={aliases}
              palette={palette}
              onAddBlockToRule={onAddBlockToRule}
            >
              <DroppableRuleSide
                aliases={aliases}
                palette={palette}
                symbols={rule.match}
                ruleIndex={ruleIndex}
                side="match"
                onAddBlockToRule={onAddBlockToRule}
              />
              <Arrow />
              <DroppableRuleSide
                aliases={aliases}
                palette={palette}
                symbols={rule.become}
                ruleIndex={ruleIndex}
                side="become"
                onAddBlockToRule={onAddBlockToRule}
              />
            </Rule>
            <RuleDropZone
              targetRuleIndex={ruleIndex + 1}
              onReorderRule={onReorderRule}
            />
          </React.Fragment>
        ))}
        <NewRuleDropZone onCreateNewRule={onCreateNewRule} />
      </div>
    </div>
  );
}

function Arrow() {
  return <div>→</div>;
}

function RuleDropZone({
  targetRuleIndex,
  onReorderRule,
}: {
  targetRuleIndex: number;
  onReorderRule?: (sourceIndex: number, targetIndex: number) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "RULE_REORDER",
    drop: (item: RuleDragItem) => {
      if (onReorderRule && item.sourceRuleIndex !== targetRuleIndex) {
        onReorderRule(item.sourceRuleIndex, targetRuleIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={isOver ? "drop-zone isOver" : "drop-zone"}
      style={{
        height: isOver ? "1.5rem" : "0.5rem",
        paddingBlock: isOver ? "0.5rem" : "0",
      }}
    />
  );
}

function BlockDropZone({
  ruleIndex,
  side,
  position,
  onAddBlockToRule,
}: {
  ruleIndex: number;
  side: "match" | "become";
  position: number;
  onAddBlockToRule?: (sourceItem: BlockDragItem, target: RuleLocation) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: DragItem) => {
      if (
        (item.type === "RULE_BLOCK" || item.type === "ALIAS_BLOCK") &&
        onAddBlockToRule
      ) {
        onAddBlockToRule(item, { ruleIndex, side, position });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={isOver ? "drop-zone isOver" : "drop-zone"}
      style={{
        boxSizing: "border-box",
        width: isOver ? "1.5rem" : "0.5rem",
        paddingInline: isOver ? "1rem" : "0",
      }}
    />
  );
}

function DroppableRuleSide({
  aliases,
  palette,
  symbols,
  ruleIndex,
  side,
  onAddBlockToRule,
}: {
  aliases: Aliases;
  palette: Palette;
  symbols: string;
  ruleIndex: number;
  side: "match" | "become";
  onAddBlockToRule?: (sourceItem: BlockDragItem, target: RuleLocation) => void;
}) {
  const symbolsArray = Array.from(symbols);

  return (
    <div className="rules-side">
      <BlockDropZone
        ruleIndex={ruleIndex}
        side={side}
        position={0}
        onAddBlockToRule={onAddBlockToRule}
      />
      {symbolsArray.map((symbol, position) => (
        <React.Fragment key={position}>
          <Draggable
            item={{
              type: "RULE_BLOCK",
              source: { ruleIndex, side, position },
              symbol,
            }}
          >
            <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
          </Draggable>
          <BlockDropZone
            ruleIndex={ruleIndex}
            side={side}
            position={position + 1}
            onAddBlockToRule={onAddBlockToRule}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function NewRuleDropZone({
  onCreateNewRule,
}: {
  onCreateNewRule: (item: BlockDragItem) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: DragItem) => {
      if (item.type === "RULE_BLOCK") {
        onCreateNewRule(item);
      } else if (item.type === "ALIAS_BLOCK") {
        onCreateNewRule(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={isOver ? "drop-zone isOver" : "drop-zone"}
      style={{
        height: "1.5rem",
        border: isOver ? "2px dashed green" : "2px dashed #ccc",
        color: "#666",
      }}
    >
      {isOver ? "Drop to create new rule" : ""}
    </div>
  );
}

type RuleProps = {
  ruleIndex: number;
  rule: Rule;
  aliases: Aliases;
  palette: Palette;
  onAddBlockToRule?: (sourceItem: BlockDragItem, target: RuleLocation) => void;
  children: React.ReactNode;
};

function Rule({ ruleIndex, children }: RuleProps) {
  return (
    <Draggable
      item={{
        type: "RULE_REORDER",
        sourceRuleIndex: ruleIndex,
      }}
      className="rule"
    >
      {children}
    </Draggable>
  );
}
