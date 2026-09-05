"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function SortableList({
  ids,
  onMove,
  children,
}: {
  ids: string[];
  onMove: (fromId: string, toId: string) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id,
  className,
  children,
  handle,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  handle?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-80", className)}
      {...(handle ? {} : { ...attributes, ...listeners })}
    >
      {handle ? (
        <SortableHandleContext.Provider value={{ attributes, listeners }}>
          {children}
        </SortableHandleContext.Provider>
      ) : (
        children
      )}
    </div>
  );
}

import { createContext, useContext } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

const SortableHandleContext = createContext<{
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
} | null>(null);

export function SortableHandle({ className }: { className?: string }) {
  const ctx = useContext(SortableHandleContext);
  return (
    <button
      type="button"
      className={cn("cursor-grab touch-none text-muted-foreground hover:text-foreground", className)}
      {...ctx?.attributes}
      {...ctx?.listeners}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
