"use client";

import { useState, useCallback } from "react";
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  sortableKeyboardCoordinates, useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, GripVertical, Calendar, User, CheckSquare2, 
  Sparkles, Loader2, ChevronDown, CheckCircle2, Circle
} from "lucide-react";
import Image from "next/image";
import { useProjectsStore, type Task, type TaskStatus, type Priority } from "@/stores/projects";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { suggestTasks } from "@/lib/ai-tasks";
import { toast } from "sonner";
import Btn from "@/components/ui/Btn";

const COLS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO",        label: "To Do",       color: "#9e97b0" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#5a8dff" },
  { id: "REVIEW",      label: "In Review",   color: "#f59e0b" },
  { id: "DONE",        label: "Done",        color: "#10b981" },
];

function TaskCard({ task, overlay = false }: { task: Task; overlay?: boolean }) {
  const { toggleSubtask, updateTask } = useProjectsStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const done = task.subtasks.filter((s) => s.done).length;
  const progressRatio = task.subtasks.length > 0 ? (done / task.subtasks.length) * 100 : 0;

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const map: Record<Priority, Priority> = {
      LOW: "MEDIUM",
      MEDIUM: "HIGH",
      HIGH: "CRITICAL",
      CRITICAL: "LOW"
    };
    updateTask(task.id, { priority: map[task.priority] });
  };

  return (
    <div 
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      className={cn(
        "soft-card rounded-2xl p-3.5 mb-2.5 select-none transition-shadow",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        overlay && "rotate-2 scale-105 !opacity-100 shadow-2xl"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono text-[var(--text-muted)] cursor-default">{task.id.toUpperCase()}</span>
        <button 
          onClick={cyclePriority} 
          title="Click to cycle priority"
          onPointerDown={(e) => e.stopPropagation()} 
          className="hover:scale-105 transition-transform"
        >
          <Badge label={task.priority} mode="priority" small />
        </button>
      </div>
      <div className="flex items-start gap-2 mb-2.5">
        <div {...listeners} className="mt-0.5 opacity-25 hover:opacity-60 cursor-grab flex-shrink-0">
          <GripVertical size={13} className="text-[var(--text-soft)]" />
        </div>
        <p className="font-semibold text-sm text-[var(--text)] flex-1 leading-tight">{task.title}</p>
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5 cursor-default">
          {task.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md text-[var(--text-muted)]" style={{ background: "var(--glass)" }}>{t}</span>
          ))}
        </div>
      )}

      {/* Subtasks Block */}
      {task.subtasks.length > 0 && (
        <div className="mb-3 space-y-1" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Subtasks</span>
            <span className="text-[9px] font-bold text-[var(--text-soft)]">{done}/{task.subtasks.length}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-1 mb-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--violet)] transition-all duration-300"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
          {/* Subtask items */}
          <div className="space-y-1">
            {task.subtasks.map((st) => (
              <label 
                key={st.id} 
                className="flex items-start gap-2 text-xs p-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  checked={st.done}
                  onChange={() => toggleSubtask(task.id, st.id)}
                  className="mt-0.5 hidden"
                />
                <button 
                  type="button"
                  onClick={() => toggleSubtask(task.id, st.id)}
                  className={cn(
                    "flex-shrink-0 mt-0.5 transition-colors", 
                    st.done ? "text-[var(--ok)]" : "text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  {st.done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                </button>
                <span className={cn("leading-tight", st.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-soft)]")}>
                  {st.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)] cursor-default">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          {task.assigneeAvatarUrl ? (
            <Image 
              src={task.assigneeAvatarUrl} 
              alt={task.assignee} 
              width={16} 
              height={16} 
              className="rounded-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-[var(--primary)] text-[8px] font-bold flex items-center justify-center text-white">
              {task.assignee.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="truncate max-w-[80px]">{task.assignee}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
          <Calendar size={10} /><span>{task.deadline}</span>
        </div>
      </div>
    </div>
  );
}

function Column({ col, tasks }: { col: typeof COLS[0]; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div 
      className={cn(
        "w-72 flex-shrink-0 rounded-2xl p-3 transition-all min-h-[280px]",
        isOver && "ring-2 ring-[var(--primary)]/50"
      )} 
      style={{ background: col.color + "10" }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
          <span className="font-semibold text-sm text-[var(--text)]">{col.label}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full text-[var(--text-muted)]" style={{ background: "var(--glass)" }}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="min-h-[120px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </SortableContext>
      </div>
      <button className="w-full mt-2 p-2 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] border border-dashed border-[var(--glass-border)] hover:border-[var(--primary)]/40 rounded-xl flex items-center justify-center gap-1 transition-colors">
        <Plus size={11} />เพิ่มงาน
      </button>
    </div>
  );
}

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const { tasks, reorderTask, projects, addTask } = useProjectsStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  
  const handleAISuggestions = async () => {
    if (!project) return;
    setLoadingAI(true);
    try {
      const suggestions = await suggestTasks(project.description, projectTasks.map(t => t.title));
      if (suggestions.length === 0) {
        toast.error("AI couldn't generate suggestions at this time.");
      } else {
        suggestions.forEach((s, idx) => {
          addTask({
            title: s.title,
            description: s.description,
            status: "TODO",
            priority: s.priority,
            assignee: "AI Suggestion",
            deadline: new Date().toISOString().split('T')[0],
            tags: ["AI Suggested"],
            subtasks: [],
            projectId: projectId,
            order: projectTasks.length + idx
          });
        });
        toast.success(`Generated ${suggestions.length} suggestions!`);
      }
    } catch (error) {
      toast.error("Failed to fetch AI suggestions.");
    } finally {
      setLoadingAI(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTask = tasks.find((t) => t.id === activeId);

  const handleDragEnd = useCallback(({ active, over }: any) => {
    setActiveId(null);
    if (!over) return;

    const overIsCol = COLS.some((c) => c.id === over.id);
    
    let targetStatus: TaskStatus | undefined;
    let overId: string | null = null;

    if (overIsCol) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
        overId = overTask.id;
      }
    }

    if (targetStatus && active.id) {
      reorderTask(active.id as string, overId, targetStatus);
    }

  }, [tasks, reorderTask]);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--violet)] bg-clip-text text-transparent">
          {project?.title || "Board"}
        </h2>
        <Btn 
          onClick={handleAISuggestions} 
          disabled={loadingAI}
          variant="secondary"
          className="gap-2 group transition-all hover:scale-105"
        >
          {loadingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-[var(--primary)] group-hover:animate-pulse" />}
          <span>Get AI Suggestions</span>
        </Btn>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 px-4">
        {COLS.map((c) => (
          <Column key={c.id} col={c} tasks={projectTasks.filter((t) => t.status === c.id).sort((a,b) => a.order - b.order)} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
