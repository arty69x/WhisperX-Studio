import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export interface Notif {
  id: string; 
  title: string; 
  msg: string;
  type: "info" | "success" | "warning" | "error"; 
  read: boolean; 
  time: string;
}

interface AppState {
  sidebarOpen: boolean; 
  cmdkOpen: boolean; 
  theme: Theme;
  notifs: Notif[];
  setSidebarOpen: (v: boolean) => void;
  setCmdkOpen: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  addNotif: (n: Omit<Notif, "id" | "time" | "read">) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: false, 
      cmdkOpen: false, 
      theme: "light",
      notifs: [
        { id: "1", title: "TaskOS Pro ✦", msg: "ระบบพร้อมใช้งาน", type: "success", read: false, time: "ตอนนี้" },
        { id: "2", title: "งานใกล้ครบกำหนด", msg: "Website Sitemap ครบกำหนดพรุ่งนี้", type: "warning", read: false, time: "2 ชม." },
      ],
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setCmdkOpen: (v) => set({ cmdkOpen: v }),
      setTheme: (t) => set({ theme: t }),
      addNotif: (n) =>
        set((s) => ({
          notifs: [
            { ...n, id: Date.now().toString(), time: "ตอนนี้", read: false },
            ...s.notifs,
          ],
        })),
      markRead: (id) =>
        set((s) => ({
          notifs: s.notifs.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      clearAll: () => set({ notifs: [] }),
    }),
    { name: "taskos-pro-app-v1" }
  )
);
