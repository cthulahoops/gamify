import React from "react";
import { useRef } from "react";
import { useDrop } from "react-dnd";

import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
import type { AliasBlockDragItem, BlockDragItem } from "./types";
import type { ColorCode, Color } from "./palette";
import { RuleSquare } from "./RuleSquare";

import { Draggable } from "./Draggable";

type AliasDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  setColor: (symbol: ColorCode, color: Color) => void;
  onAddBlockToAlias: (item: AliasBlockDragItem, targetAlias: string) => void;
  onCreateNewAlias: (item: BlockDragItem) => void;
};

function DroppableRHS({
  aliases,
  palette,
  alias,
  codes,
  onAddBlockToAlias,
}: {
  aliases: Aliases;
  palette: Palette;
  alias: string;
  codes: string[];
  onAddBlockToAlias: (item: AliasBlockDragItem, alias: string) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "ALIAS_BLOCK",
    drop: (item: AliasBlockDragItem) => {
      if (item.sourceAlias !== alias) {
        onAddBlockToAlias(item, alias);
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
      }}
    >
      {codes.map((symbol, idx) => (
        <Draggable
          item={{
            type: "ALIAS_BLOCK",
            sourceAlias: alias,
            sourceIndex: idx,
            symbol,
          }}
          key={symbol}
        >
          <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
        </Draggable>
      ))}
    </div>
  );
}

function NewAliasDropZone({
  onCreateNewAlias,
}: {
  onCreateNewAlias?: (item: BlockDragItem) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "ALIAS_BLOCK"],
    drop: (item: BlockDragItem) => {
      if (onCreateNewAlias) {
        onCreateNewAlias(item);
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
        width: "100%",
        border: isOver ? "2px dashed green" : "2px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gridColumn: "span 3",
        color: "#666",
      }}
    >
      {isOver ? "Drop to create new alias" : ""}
    </div>
  );
}

export function AliasesDisplay({
  aliases,
  palette,
  onAddBlockToAlias,
  onCreateNewAlias,
  setColor,
}: AliasDisplayProps) {
  return (
    <div id="aliases-display">
      {palette.map((color: Color, symbol: ColorCode) => (
        <React.Fragment key={symbol}>
          <div className="rules-side" key={symbol}>
            <Draggable
              item={{
                type: "ALIAS_BLOCK",
                sourceAlias: symbol,
                sourceIndex: -1,
                symbol: symbol,
              }}
            >
              <RuleSquare aliases={aliases} palette={palette} symbol={symbol} />
            </Draggable>
          </div>
          <div className="rule-arrow">=</div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(symbol, e.target.value as Color)}
            className="palette-input"
          />
        </React.Fragment>
      ))}
      {aliases.map((alias, codes) => (
        <React.Fragment key={alias}>
          <div className="rules-side">
            <Draggable
              item={{
                type: "ALIAS_BLOCK",
                sourceAlias: alias,
                sourceIndex: -1,
                symbol: alias,
              }}
            >
              <RuleSquare aliases={aliases} palette={palette} symbol={alias} />
            </Draggable>
          </div>
          <div className="rule-arrow">=</div>
          <DroppableRHS
            aliases={aliases}
            palette={palette}
            alias={alias}
            codes={codes}
            onAddBlockToAlias={onAddBlockToAlias}
          />
        </React.Fragment>
      ))}
      <NewAliasDropZone onCreateNewAlias={onCreateNewAlias} />
    </div>
  );
}
