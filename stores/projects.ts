import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { randomId } from "@/lib/utils";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  assigneeAvatarUrl?: string;
  deadline: string;
  tags: string[];
  subtasks: SubTask[];
  projectId: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  progress: number;
  deadline: string;
  members: string[];
  budget: number;
  spent: number;
  createdAt: string;
}

const SEED_PROJECTS: Project[] = [
  { 
    id: "p1", 
    title: "HA Digital Healthcare Portal", 
    description: "Full-stack digital transformation", 
    color: "#5a8dff", 
    progress: 67, 
    deadline: "2024-08-30", 
    members: ["Alice", "Bob", "Carol"], 
    budget: 3000000, 
    spent: 1920000, 
    createdAt: "2024-01-10" 
  },
  { 
    id: "p2", 
    title: "E-Commerce Platform B2B", 
    description: "Marketplace for Thai SMEs", 
    color: "#8b5cf6", 
    progress: 32, 
    deadline: "2024-10-15", 
    members: ["Dave", "Eve"], 
    budget: 1500000, 
    spent: 480000, 
    createdAt: "2024-02-01" 
  },
];

const SEED_TASKS: Task[] = [
  { 
    id: "t1", 
    title: "Website Sitemap & User Flow", 
    description: "Complete IA for all 15 modules", 
    status: "DONE", 
    priority: "HIGH", 
    assignee: "Alice",
    assigneeAvatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    deadline: "2024-02-13", 
    tags: ["UX", "Planning"], 
    subtasks: [
      { id: "s1", title: "Draft IA", done: true },
      { id: "s2", title: "Client review", done: true }
    ], 
    projectId: "p1", 
    order: 0 
  },
  { 
    id: "t2", 
    title: "Moodboard Design Style", 
    description: "Retro 80s-90s direction", 
    status: "IN_PROGRESS", 
    priority: "MEDIUM", 
    assignee: "Bob",
    assigneeAvatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    deadline: "2024-02-17", 
    tags: ["Design"], 
    subtasks: [
      { id: "s3", title: "Pinterest board", done: true },
      { id: "s4", title: "Color tokens", done: false }
    ], 
    projectId: "p1", 
    order: 1 
  },
  { 
    id: "t3", 
    title: "Final Wireframe", 
    description: "1440px + 390px breakpoints", 
    status: "TODO", 
    priority: "MEDIUM", 
    assignee: "Alice", 
    deadline: "2024-02-20", 
    tags: ["Design"], 
    subtasks: [], 
    projectId: "p1", 
    order: 2 
  },
  { 
    id: "t4", 
    title: "Illustrations Moodboard", 
    description: "Custom illustration style guide", 
    status: "TODO", 
    priority: "LOW", 
    assignee: "Carol", 
    deadline: "2024-02-25", 
    tags: ["Design", "Art"], 
    subtasks: [], 
    projectId: "p1", 
    order: 3 
  },
  { 
    id: "t5", 
    title: "API Architecture", 
    description: "REST + GraphQL schema", 
    status: "REVIEW", 
    priority: "CRITICAL", 
    assignee: "Dave", 
    deadline: "2024-02-18", 
    tags: ["Dev", "Backend"], 
    subtasks: [], 
    projectId: "p2", 
    order: 0 
  },
  { 
    id: "t6", 
    title: "Payment Gateway Integration", 
    description: "KBank + SCB + PromptPay", 
    status: "TODO", 
    priority: "HIGH", 
    assignee: "Eve", 
    deadline: "2024-03-01", 
    tags: ["Dev", "Fintech"], 
    subtasks: [], 
    projectId: "p2", 
    order: 1 
  },
];

export interface ProjectTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultTasks: Partial<Task>[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "software-dev",
    name: "Software Development",
    icon: "💻",
    description: "Standard agile workflow with dev, test, and deploy tasks.",
    defaultTasks: [
      { title: "Project Setup & Repo initialization", priority: "HIGH", description: "Initialize git, package manager, and base project structure." },
      { title: "Architecture Design", priority: "CRITICAL", description: "Define tech stack and system diagrams." },
      { title: "UI Mockups", priority: "MEDIUM", description: "Create visual designs and user flows." }
    ]
  },
  {
    id: "marketing-campaign",
    name: "Marketing Campaign",
    icon: "🚀",
    description: "Multi-channel marketing plan with creative and strategy.",
    defaultTasks: [
      { title: "Market Research", priority: "HIGH", description: "Analyze competitors and target audience." },
      { title: "Content Calendar", priority: "MEDIUM", description: "Plan posts across all social channels." },
      { title: "Ad Creative Production", priority: "HIGH", description: "Design banners and write copy." }
    ]
  }
];

interface State {
  projects: Project[]; 
  tasks: Task[]; 
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  addProject: (p: Omit<Project, "id" | "createdAt">, templateId?: string) => void;
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTask: (activeId: string, overId: string | null, targetStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, stId: string) => void;
}

export const useProjectsStore = create<State>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS, 
      tasks: SEED_TASKS, 
      activeProjectId: "p1",
      setActiveProject: (id) => set({ activeProjectId: id }),
      addProject: (p, templateId) =>
        set(
          produce((s: State) => {
            const newId = randomId();
            s.projects.push({ ...p, id: newId, createdAt: new Date().toISOString() });
            
            if (templateId) {
              const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
              if (template) {
                template.defaultTasks.forEach((dt, idx) => {
                  s.tasks.push({
                    id: randomId(),
                    title: dt.title || "Untitled Task",
                    description: dt.description || "",
                    status: "TODO",
                    priority: dt.priority || "MEDIUM",
                    assignee: "Unassigned",
                    deadline: new Date().toISOString().split('T')[0],
                    tags: [],
                    subtasks: [],
                    projectId: newId,
                    order: idx
                  });
                });
              }
            }
          })
        ),
      addTask: (t) =>
        set(
          produce((s: State) => {
            s.tasks.push({ ...t, id: randomId() });
          })
        ),
      updateTask: (id, data) =>
        set(
          produce((s: State) => {
            const i = s.tasks.findIndex((t) => t.id === id);
            if (i >= 0) Object.assign(s.tasks[i], data);
          })
        ),
      moveTask: (id, status) =>
        set(
          produce((s: State) => {
            const t = s.tasks.find((t) => t.id === id);
            if (t) {
              t.status = status;
              // Add to bottom of the new column
              const colTasks = s.tasks.filter(x => x.projectId === t.projectId && x.status === status);
              t.order = colTasks.length ? Math.max(...colTasks.map(x => x.order)) + 1 : 0;
            }
          })
        ),
      reorderTask: (activeId, overId, targetStatus) =>
        set(
          produce((s: State) => {
            const activeIndex = s.tasks.findIndex(t => t.id === activeId);
            if (activeIndex === -1) return;
            const activeTask = s.tasks[activeIndex];
            
            const oldStatus = activeTask.status;
            activeTask.status = targetStatus;

            const targetTasks = s.tasks
              .filter(t => t.projectId === activeTask.projectId && t.status === targetStatus && t.id !== activeId)
              .sort((a, b) => a.order - b.order);

            let newIndex = targetTasks.length;
            if (overId) {
              const overListIndex = targetTasks.findIndex(t => t.id === overId);
              if (overListIndex !== -1) {
                newIndex = overListIndex;
              }
            }

            // Insert into the sorted target tasks array
            targetTasks.splice(newIndex, 0, activeTask);

            // Re-assign order for everyone in the target array
            targetTasks.forEach((t, i) => {
              const globalIndex = s.tasks.findIndex(x => x.id === t.id);
              if (globalIndex !== -1) {
                s.tasks[globalIndex].order = i;
              }
            });
          })
        ),
      toggleSubtask: (taskId, stId) =>
        set(
          produce((s: State) => {
            const t = s.tasks.find((t) => t.id === taskId);
            const st = t?.subtasks.find((s) => s.id === stId);
            if (st) st.done = !st.done;
          })
        ),
    }),
    { name: "taskos-pro-projects-v1" }
  )
);
