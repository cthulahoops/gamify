import React from "react";
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

type AliasDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  onMoveBlock?: (
    sourceAlias: string,
    sourceIndex: number,
    targetAlias: string,
    targetIndex?: number,
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
  const [{ isDragging }, drag] = useDrag({
    type: "ALIAS_BLOCK",
    item: { type: "ALIAS_BLOCK", sourceAlias, sourceIndex, symbol },
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

  return (
    <div
      ref={drop as any}
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

export function AliasesDisplay({
  aliases,
  palette,
  onMoveBlock,
}: AliasDisplayProps) {
  return (
    <div id="aliases-display">
      {Array.from(aliases.aliases.entries()).map(([alias, codes]) => (
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
    </div>
  );
}
