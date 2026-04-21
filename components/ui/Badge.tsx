import { PRIORITY_COLOR, STATUS_COLOR } from "@/lib/tokens";

type M = "priority" | "status" | "custom";

interface P { 
  label: string; 
  mode?: M; 
  color?: string; 
  small?: boolean; 
}

export default function Badge({ label, mode = "custom", color, small = false }: P) {
  const c = mode === "priority" ? PRIORITY_COLOR[label] : 
            mode === "status" ? STATUS_COLOR[label] : 
            (color || "rgba(109,99,134,0.4)");
            
  return (
    <span 
      className={`inline-flex items-center justify-center font-semibold rounded-full border ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}
      style={{ background: c + "22", color: c, borderColor: c + "38" }}
    >
      {label}
    </span>
  );
}
