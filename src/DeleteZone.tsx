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
      style={{
        height: "60px",
        width: "100%",
        backgroundColor: isOver
          ? "rgba(255, 0, 0, 0.2)"
          : "rgba(200, 200, 200, 0.1)",
        border: isOver ? "2px dashed red" : "2px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10px",
        fontSize: "14px",
        color: isOver ? "#d00" : "#666",
        borderRadius: "4px",
      }}
    >
      {isOver ? "🗑️ Drop to delete" : "🗑️ Delete zone"}
    </div>
  );
}
