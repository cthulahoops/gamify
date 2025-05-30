import type { DragItem } from "./types";
import { useRef } from "react";
import { useDrag } from "react-dnd";

export function Draggable({
  item,
  children,
  className,
}: {
  item: DragItem;
  children: React.ReactNode;
  className?: string;
}) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: item.type,
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={className}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {children}
    </div>
  );
}
