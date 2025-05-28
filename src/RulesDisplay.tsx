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

function DropZone({
  ruleIndex,
  side,
  position,
  onMoveRuleBlock,
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
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "RULE_BLOCK",
    drop: (item: RuleDragItem) => {
      if (onMoveRuleBlock) {
        onMoveRuleBlock(
          item.sourceRuleIndex,
          item.sourceSide,
          item.sourcePosition,
          ruleIndex,
          side,
          position,
        );
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
          />
        </React.Fragment>
      ))}
    </div>
  );
}

export function RulesDisplay({
  rules,
  aliases,
  palette,
  onMoveRuleBlock,
}: RulesDisplayProps) {
  return (
    <div id="rules-graphical">
      {rules.map((rule, ruleIndex) => (
        <React.Fragment key={ruleIndex}>
          <DroppableRuleSide
            aliases={aliases}
            palette={palette}
            symbols={rule.match}
            ruleIndex={ruleIndex}
            side="match"
            onMoveRuleBlock={onMoveRuleBlock}
          />
          <div className="rule-arrow">→</div>
          <DroppableRuleSide
            aliases={aliases}
            palette={palette}
            symbols={rule.become}
            ruleIndex={ruleIndex}
            side="become"
            onMoveRuleBlock={onMoveRuleBlock}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
