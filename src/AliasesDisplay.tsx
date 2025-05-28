import React from "react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
import { RuleSquare } from "./RuleSquare";

type DragItem = {
  type: "ALIAS_BLOCK";
  sourceAlias: string;
  sourceIndex: number;
  symbol: string;
};

type RuleDragItem = {
  type: "RULE_BLOCK";
  sourceRuleIndex: number;
  sourceSide: "match" | "become";
  sourcePosition: number;
  symbol: string;
};

type AllDragItems = DragItem | RuleDragItem;

type AliasDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  onMoveBlock?: (
    sourceAlias: string,
    sourceIndex: number,
    targetAlias: string,
    targetIndex?: number,
  ) => void;
  onCreateNewAlias?: (
    symbol: string,
    sourceInfo?: {
      type: "RULE_BLOCK" | "ALIAS_BLOCK";
      sourceRuleIndex?: number;
      sourceSide?: "match" | "become";
      sourcePosition?: number;
      sourceAlias?: string;
      sourceIndex?: number;
    },
  ) => void;
};

function DraggableBlock({
  aliases,
  palette,
  symbol,
  sourceAlias,
  sourceIndex,
}: {
  aliases: Aliases;
  palette: Palette;
  symbol: string;
  sourceAlias: string;
  sourceIndex: number;
}) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "ALIAS_BLOCK",
    item: { type: "ALIAS_BLOCK", sourceAlias, sourceIndex, symbol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(dragRef);

  return (
    <div
      ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
    </div>
  );
}

function DroppableRHS({
  aliases,
  palette,
  alias,
  codes,
  onMoveBlock,
}: {
  aliases: Aliases;
  palette: Palette;
  alias: string;
  codes: string[];
  onMoveBlock?: (
    sourceAlias: string,
    sourceIndex: number,
    targetAlias: string,
    targetIndex?: number,
  ) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "ALIAS_BLOCK",
    drop: (item: DragItem) => {
      if (onMoveBlock && item.sourceAlias !== alias) {
        onMoveBlock(item.sourceAlias, item.sourceIndex, alias);
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
      className="rules-side"
      style={{
        backgroundColor: isOver ? "rgba(0, 255, 0, 0.2)" : "transparent",
        minHeight: "40px",
        minWidth: "40px",
      }}
    >
      {codes.map((symbol, idx) => (
        <DraggableBlock
          key={idx}
          aliases={aliases}
          palette={palette}
          symbol={symbol}
          sourceAlias={alias}
          sourceIndex={idx}
        />
      ))}
    </div>
  );
}

function NewAliasDropZone({
  onCreateNewAlias,
}: {
  onCreateNewAlias?: (
    symbol: string,
    sourceInfo?: {
      type: "RULE_BLOCK" | "ALIAS_BLOCK";
      sourceRuleIndex?: number;
      sourceSide?: "match" | "become";
      sourcePosition?: number;
      sourceAlias?: string;
      sourceIndex?: number;
    },
  ) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: AllDragItems) => {
      if (onCreateNewAlias) {
        if (item.type === "RULE_BLOCK") {
          onCreateNewAlias(item.symbol, {
            type: "RULE_BLOCK",
            sourceRuleIndex: item.sourceRuleIndex,
            sourceSide: item.sourceSide,
            sourcePosition: item.sourcePosition,
          });
        } else {
          onCreateNewAlias(item.symbol, {
            type: "ALIAS_BLOCK",
            sourceAlias: item.sourceAlias,
            sourceIndex: item.sourceIndex,
          });
        }
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
      {isOver ? "Drop to create new alias" : "Drop here to create new alias"}
    </div>
  );
}

export function AliasesDisplay({
  aliases,
  palette,
  onMoveBlock,
  onCreateNewAlias,
}: AliasDisplayProps) {
  return (
    <div id="aliases-display">
      {aliases.map((alias, codes) => (
        <React.Fragment key={alias}>
          <div className="rules-side">
            <DraggableBlock
              aliases={aliases}
              palette={palette}
              symbol={alias}
              sourceAlias={alias}
              sourceIndex={-1}
            />
          </div>
          <div className="rule-arrow">=</div>
          <DroppableRHS
            aliases={aliases}
            palette={palette}
            alias={alias}
            codes={codes}
            onMoveBlock={onMoveBlock}
          />
        </React.Fragment>
      ))}
      <NewAliasDropZone onCreateNewAlias={onCreateNewAlias} />
    </div>
  );
}
