import React from "react";
import { useDrag, useDrop } from "react-dnd";

import type { Rule } from "./types";
import type { Palette } from "./palette";
import type { Aliases } from "./aliases";
import { RuleSquare } from "./RuleSquare";

type RuleDragItem = {
  type: "RULE_BLOCK";
  sourceRuleIndex: number;
  sourceSide: "match" | "become";
  sourcePosition: number;
  symbol: string;
};

type AliasDragItem = {
  type: "ALIAS_BLOCK";
  sourceAlias: string;
  sourceIndex: number;
  symbol: string;
};

type RuleReorderDragItem = {
  type: "RULE_REORDER";
  sourceRuleIndex: number;
};

type DragItem = RuleDragItem | AliasDragItem | RuleReorderDragItem;

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
  onCreateNewRule?: (symbol: string) => void;
  onReorderRule?: (sourceIndex: number, targetIndex: number) => void;
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
  const [{ isDragging }, drag] = useDrag({
    type: "RULE_BLOCK",
    item: {
      type: "RULE_BLOCK",
      sourceRuleIndex,
      sourceSide,
      sourcePosition,
      symbol,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
    </div>
  );
}

function DraggableArrow({ ruleIndex }: { ruleIndex: number }) {
  const [{ isDragging }, drag] = useDrag({
    type: "RULE_REORDER",
    item: {
      type: "RULE_REORDER",
      sourceRuleIndex: ruleIndex,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className="rule-arrow"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      →
    </div>
  );
}

function RuleDropZone({
  targetRuleIndex,
  onReorderRule,
}: {
  targetRuleIndex: number;
  onReorderRule?: (sourceIndex: number, targetIndex: number) => void;
}) {
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

  return (
    <div
      ref={drop as any}
      style={{
        height: "4px",
        width: "100%",
        backgroundColor: isOver ? "rgba(0, 255, 0, 0.8)" : "transparent",
        border: isOver ? "2px solid green" : "none",
        marginBottom: isOver ? "4px" : "0",
        gridColumn: "1 / -1",
      }}
    />
  );
}

function DropZone({
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

  return (
    <div
      ref={drop as any}
      style={{
        width: "8px",
        height: "40px",
        backgroundColor: isOver ? "rgba(0, 255, 0, 0.5)" : "transparent",
        border: isOver ? "2px dashed green" : "none",
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
    <div
      className="rules-side"
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "40px",
      }}
    >
      <DropZone
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
          <DropZone
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
  onCreateNewRule?: (
    symbol: string,
    sourceInfo?: {
      type: "RULE_BLOCK" | "ALIAS_BLOCK";
      sourceRuleIndex?: number;
      sourceSide?: "match" | "become";
      sourcePosition?: number;
    },
  ) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: DragItem) => {
      if (onCreateNewRule) {
        if (item.type === "RULE_BLOCK") {
          onCreateNewRule(item.symbol, {
            type: "RULE_BLOCK",
            sourceRuleIndex: item.sourceRuleIndex,
            sourceSide: item.sourceSide,
            sourcePosition: item.sourcePosition,
          });
        } else if (item.type === "ALIAS_BLOCK") {
          onCreateNewRule(item.symbol, {
            type: "ALIAS_BLOCK",
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      style={{
        height: "60px",
        width: "100%",
        backgroundColor: isOver
          ? "rgba(0, 255, 0, 0.2)"
          : "rgba(200, 200, 200, 0.1)",
        border: isOver ? "2px dashed green" : "2px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10px",
        fontSize: "14px",
        color: "#666",
      }}
    >
      {isOver ? "Drop to create new rule" : "Drop here to create new rule"}
    </div>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, auto)",
          width: "fit-content",
          rowGap: "0.25rem",
        }}
      >
        <RuleDropZone targetRuleIndex={0} onReorderRule={onReorderRule} />

        {rules.map((rule, ruleIndex) => (
          <React.Fragment key={ruleIndex}>
            <DroppableRuleSide
              aliases={aliases}
              palette={palette}
              symbols={rule.match}
              ruleIndex={ruleIndex}
              side="match"
              onMoveRuleBlock={onMoveRuleBlock}
              onCopyAliasToRule={onCopyAliasToRule}
            />
            <DraggableArrow ruleIndex={ruleIndex} />
            <DroppableRuleSide
              aliases={aliases}
              palette={palette}
              symbols={rule.become}
              ruleIndex={ruleIndex}
              side="become"
              onMoveRuleBlock={onMoveRuleBlock}
              onCopyAliasToRule={onCopyAliasToRule}
            />

            <RuleDropZone
              targetRuleIndex={ruleIndex + 1}
              onReorderRule={onReorderRule}
            />
          </React.Fragment>
        ))}
      </div>
      <NewRuleDropZone onCreateNewRule={onCreateNewRule} />
    </div>
  );
}
