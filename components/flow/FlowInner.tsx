"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  Handle,
  Position,
  NodeResizer,
  NodeProps,
  applyNodeChanges,
  applyEdgeChanges
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Btn from "@/components/ui/Btn";
import GlassCard from "@/components/ui/GlassCard";
import { Plus, Save, Download, Share2, Trash2, Cpu, Zap, Activity } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════
// CUSTOM NODE COMPONENTS
// ═══════════════════════════════════════════════════════════════════

const CustomNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`relative px-4 py-3 min-w-[180px] rounded-xl border backdrop-blur-xl bg-black/40 shadow-2xl transition-all duration-300 ${selected ? 'border-[var(--primary)] shadow-[var(--primary)]/20 shadow-xl' : 'border-white/10 hover:border-white/20'}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--primary)] !border-2 !border-black" />
      
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-md ${data.theme || 'bg-[var(--primary)]/20 text-[var(--primary)]'}`}>
             {data.icon === 'cpu' ? <Cpu size={12} /> : data.icon === 'zap' ? <Zap size={12} /> : <Activity size={12} />}
           </div>
           <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">{data.category || 'NODE'}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-bold text-white block">{data.label}</label>
        <span className="text-[10px] text-white/40 leading-tight block">{data.description || "Node execution block"}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--cyan)] !border-2 !border-black" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// ═══════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const initialNodes = [
  { 
    id: "1", type: "custom", position: { x: 250, y: 100 }, 
    data: { label: "Trigger Event", description: "Fires when user connects.", category: "START", icon: "zap", theme: "bg-[var(--ok)]/20 text-[var(--ok)]" } 
  },
  { 
    id: "2", type: "custom", position: { x: 50, y: 300 }, 
    data: { label: "Data Evaluator", description: "Processes inbound JSON.", category: "COMPUTE", icon: "cpu", theme: "bg-[var(--primary)]/20 text-[var(--primary)]" } 
  },
  { 
    id: "3", type: "custom", position: { x: 450, y: 300 }, 
    data: { label: "Formatter", description: "Restructures payload for DB.", category: "MODIFIER", icon: "activity", theme: "bg-[var(--cyan)]/20 text-[var(--cyan)]" } 
  },
  { 
    id: "4", type: "custom", position: { x: 250, y: 500 }, 
    data: { label: "DB Inject", description: "Pushes data to Firebase.", category: "ACTION", icon: "cpu", theme: "bg-[var(--warn)]/20 text-[var(--warn)]" } 
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "var(--primary)", strokeWidth: 2 } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "var(--cyan)", strokeWidth: 2 } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "var(--glass-border)", strokeWidth: 2 } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "var(--glass-border)", strokeWidth: 2 } },
];

export default function FlowInner() {
  const [nodes, setNodes] = useState(initialNodes as any);
  const [edges, setEdges] = useState(initialEdges as any);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds: any) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds: any) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: any) => addEdge({ ...params, animated: true, style: { stroke: "var(--primary)", strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const handleAddNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: "custom",
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { 
         label: "New Node", 
         description: "Custom task node.", 
         category: "TASK",
         icon: "activity",
         theme: "bg-[var(--text)]/10 text-white" 
      }
    };
    setNodes((nds: any) => [...nds, newNode]);
    toast.success("Node integrated to flow.");
  };

  const handleSave = () => {
    // Mock save
    toast.success("Workflow schema successfully retained.");
  };

  const handleClear = () => {
     setNodes([]);
     setEdges([]);
     toast.success("Canvas wiped clean.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="h-full w-full relative bg-[#06000f] overflow-hidden"
    >
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        className="z-10"
      >
        <Controls className="!bg-black/60 !border-white/10 !backdrop-blur-xl rounded-xl overflow-hidden [&>button]:!border-white/10 [&>button]:!text-white hover:[&>button]:!bg-white/10" />
        
        <MiniMap 
          className="!bg-black/60 !border-white/10 !backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl"
          nodeColor={(n: any) => {
             if (n.data?.category === "START") return "var(--ok)";
             if (n.data?.category === "COMPUTE") return "var(--primary)";
             if (n.data?.category === "MODIFIER") return "var(--cyan)";
             if (n.data?.category === "ACTION") return "var(--warn)";
             return "rgba(255,255,255,0.2)";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
        
        <Panel position="top-right" className="z-50">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex gap-2"
          >
            <Btn small onClick={handleAddNode} className="border-white/10 bg-black/40 backdrop-blur hover:bg-white/10"><Plus size={14} className="mr-1" /> Add Node</Btn>
            <Btn small onClick={handleClear} className="border-white/10 bg-black/40 backdrop-blur hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"><Trash2 size={14} className="mr-1" /> Clear</Btn>
            <Btn small primary onClick={handleSave}><Save size={14} className="mr-1" /> Commit</Btn>
          </motion.div>
        </Panel>

        <Panel position="top-left" className="z-50">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <GlassCard className="px-5 py-3 border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
                 <h3 className="font-black text-xs uppercase tracking-widest text-white">Flow Blueprint</h3>
              </div>
              <p className="text-[10px] text-white/40 tracking-wide max-w-[200px]">Link operational nodes to trigger autonomous graph execution pipelines.</p>
            </GlassCard>
          </motion.div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
