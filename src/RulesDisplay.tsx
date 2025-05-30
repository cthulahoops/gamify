import React from "react";
import { useRef } from "react";
import { useDrop } from "react-dnd";

import type { Rule, DragItem, RuleReorderDragItem } from "./types";
import type { Palette } from "./palette";
import type { Aliases } from "./aliases";
import { RuleSquare } from "./RuleSquare";
import type { RuleDragItem, AliasDragItem } from "./types";
import { Draggable } from "./Draggable";

type RulesDisplayProps = {
  rules: Rule[];
  aliases: Aliases;
  palette: Palette;
  onMoveRuleBlock?: (
    sourceRuleIndex: number,
    sourceSide: "match" | "become",
    sourcePosition: number,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition?: number,
  ) => void;
  onCopyAliasToRule?: (
    symbol: string,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => void;
  onCreateNewRule: (item: RuleDragItem | AliasDragItem) => void;
  onReorderRule?: (sourceIndex: number, targetIndex: number) => void;
  onDeleteRuleBlock?: (
    ruleIndex: number,
    side: "match" | "become",
    position: number,
  ) => void;
  onDeleteRule?: (ruleIndex: number) => void;
  onDeleteAliasBlock?: (sourceAlias: string, sourceIndex: number) => void;
};

function DraggableRuleBlock({
  aliases,
  palette,
  symbol,
  sourceRuleIndex,
  sourceSide,
  sourcePosition,
}: {
  aliases: Aliases;
  palette: Palette;
  symbol: string;
  sourceRuleIndex: number;
  sourceSide: "match" | "become";
  sourcePosition: number;
}) {
  return (
    <Draggable
      item={{
        type: "RULE_BLOCK",
        sourceRuleIndex,
        sourceSide,
        sourcePosition,
        symbol,
      }}
    >
      <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
    </Draggable>
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
    drop: (item: RuleReorderDragItem) => {
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
  onMoveRuleBlock,
  onCopyAliasToRule,
}: {
  ruleIndex: number;
  side: "match" | "become";
  position: number;
  onMoveRuleBlock?: (
    sourceRuleIndex: number,
    sourceSide: "match" | "become",
    sourcePosition: number,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition?: number,
  ) => void;
  onCopyAliasToRule?: (
    symbol: string,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: DragItem) => {
      if (item.type === "RULE_BLOCK" && onMoveRuleBlock) {
        onMoveRuleBlock(
          item.sourceRuleIndex,
          item.sourceSide,
          item.sourcePosition,
          ruleIndex,
          side,
          position,
        );
      } else if (item.type === "ALIAS_BLOCK" && onCopyAliasToRule) {
        onCopyAliasToRule(item.symbol, ruleIndex, side, position);
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
  onMoveRuleBlock,
  onCopyAliasToRule,
}: {
  aliases: Aliases;
  palette: Palette;
  symbols: string;
  ruleIndex: number;
  side: "match" | "become";
  onMoveRuleBlock?: (
    sourceRuleIndex: number,
    sourceSide: "match" | "become",
    sourcePosition: number,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition?: number,
  ) => void;
  onCopyAliasToRule?: (
    symbol: string,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => void;
}) {
  const symbolsArray = Array.from(symbols);

  return (
    <div className="rules-side">
      <BlockDropZone
        ruleIndex={ruleIndex}
        side={side}
        position={0}
        onMoveRuleBlock={onMoveRuleBlock}
        onCopyAliasToRule={onCopyAliasToRule}
      />
      {symbolsArray.map((symbol, position) => (
        <React.Fragment key={position}>
          <DraggableRuleBlock
            aliases={aliases}
            palette={palette}
            symbol={symbol}
            sourceRuleIndex={ruleIndex}
            sourceSide={side}
            sourcePosition={position}
          />
          <BlockDropZone
            ruleIndex={ruleIndex}
            side={side}
            position={position + 1}
            onMoveRuleBlock={onMoveRuleBlock}
            onCopyAliasToRule={onCopyAliasToRule}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function NewRuleDropZone({
  onCreateNewRule,
}: {
  onCreateNewRule: (sourceInfo: RuleDragItem | AliasDragItem) => void;
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
  onMoveRuleBlock?: (
    sourceRuleIndex: number,
    sourceSide: "match" | "become",
    sourcePosition: number,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition?: number,
  ) => void;
  onCopyAliasToRule?: (
    symbol: string,
    targetRuleIndex: number,
    targetSide: "match" | "become",
    targetPosition: number,
  ) => void;
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

export function RulesDisplay({
  rules,
  aliases,
  palette,
  onMoveRuleBlock,
  onCopyAliasToRule,
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
              onMoveRuleBlock={onMoveRuleBlock}
              onCopyAliasToRule={onCopyAliasToRule}
            >
              <DroppableRuleSide
                aliases={aliases}
                palette={palette}
                symbols={rule.match}
                ruleIndex={ruleIndex}
                side="match"
                onMoveRuleBlock={onMoveRuleBlock}
                onCopyAliasToRule={onCopyAliasToRule}
              />
              <Arrow />
              <DroppableRuleSide
                aliases={aliases}
                palette={palette}
                symbols={rule.become}
                ruleIndex={ruleIndex}
                side="become"
                onMoveRuleBlock={onMoveRuleBlock}
                onCopyAliasToRule={onCopyAliasToRule}
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
