import { useRef } from "react";
import { useDrop } from "react-dnd";
import type { DragItem } from "./types";
export function DeleteZone({
  onDelete,
}: {
  onDelete: (item: DragItem) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ["RULE_BLOCK", "RULE_REORDER", "ALIAS_BLOCK"],
    drop: onDelete,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={isOver ? "drop-zone isOver delete" : "drop-zone delete"}
      style={{
        height: "2rem",
        width: "2rem",
        position: "absolute",
        top: "0",
        right: "0",
      }}
    >
      ❌
    </div>
  );
}
