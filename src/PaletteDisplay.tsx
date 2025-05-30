import React from "react";
import { useRef } from "react";
import { useDrop } from "react-dnd";

import type { Aliases } from "./aliases";
import type { Palette } from "./palette";
import type { AliasBlockDragItem, BlockDragItem } from "./types";
import type { ColorCode, Color } from "./palette";
import { RuleSquare } from "./RuleSquare";

import { Draggable } from "./Draggable";

type PaletteDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  setColor: (symbol: ColorCode, color: Color) => void;
  onAddBlockToAlias: (item: AliasBlockDragItem, targetAlias: string) => void;
  onCreateNewAlias: (item: BlockDragItem) => void;
  onAddColor: () => void;
};

type ColorsDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  setColor: (symbol: ColorCode, color: Color) => void;
  onAddColor: () => void;
};

type AliasesDisplayProps = {
  aliases: Aliases;
  palette: Palette;
  onAddBlockToAlias: (item: AliasBlockDragItem, targetAlias: string) => void;
  onCreateNewAlias: (item: BlockDragItem) => void;
};

export function PaletteDisplay({
  aliases,
  palette,
  onAddBlockToAlias,
  onCreateNewAlias,
  setColor,
  onAddColor,
}: PaletteDisplayProps) {
  return (
    <div id="aliases-display">
      <AliasesDisplay
        aliases={aliases}
        palette={palette}
        onAddBlockToAlias={onAddBlockToAlias}
        onCreateNewAlias={onCreateNewAlias}
      />
      <ColorsDisplay
        aliases={aliases}
        palette={palette}
        setColor={setColor}
        onAddColor={onAddColor}
      />
    </div>
  );
}

function ColorsDisplay({
  aliases,
  palette,
  setColor,
  onAddColor,
}: ColorsDisplayProps) {
  return (
    <>
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
      <button
        onClick={onAddColor}
        className="add-color-button"
        style={{ gridColumn: "span 3", margin: "0.5rem 0" }}
      >
        Add Color
      </button>
    </>
  );
}

function AliasesDisplay({
  aliases,
  palette,
  onAddBlockToAlias,
  onCreateNewAlias,
}: AliasesDisplayProps) {
  return (
    <>
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
          <DroppableRHS alias={alias} onAddBlockToAlias={onAddBlockToAlias}>
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
                <RuleSquare
                  aliases={aliases}
                  palette={palette}
                  symbol={symbol}
                />
              </Draggable>
            ))}
          </DroppableRHS>
        </React.Fragment>
      ))}
      <NewAliasDropZone onCreateNewAlias={onCreateNewAlias} />
    </>
  );
}

function DroppableRHS({
  alias,
  onAddBlockToAlias,
  children,
}: {
  alias: string;
  onAddBlockToAlias: (item: AliasBlockDragItem, alias: string) => void;
  children: React.ReactNode;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "ALIAS_BLOCK",
    drop: (item: AliasBlockDragItem) => {
      onAddBlockToAlias(item, alias);
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
      {children}
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
