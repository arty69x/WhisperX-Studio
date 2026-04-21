"use client";

import { useState, useRef, useEffect, useReducer } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
//  DESIGN TOKENS (Shared with globals.css)
// ═══════════════════════════════════════════════════════════════════
const T = {
  bg: "#06000f",
  bg1: "#0d001a",
  bg2: "#160028",
  bg3: "#1c1c1c",
  bg4: "#2a2a2a",
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.13)",
  line3: "rgba(255,255,255,0.22)",
  text: "#ffffff",
  textSub: "#b3b3b3",
  textDim: "#666666",
  red: "#ff2d6b",
  orange: "#f4511e",
  yellow: "#ffcc00",
  green: "#00e5a0",
  blue: "#00d1ff",
  cyan: "#00d1ff",
  purple: "#8b00ff",
  pink: "#ff2d6b",
};

// ═══════════════════════════════════════════════════════════════════
//  NODE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════
const PORT = { IN: "in", OUT: "out" };
const TYPES = { ANY: "any", NUMBER: "number", STRING: "string", COLOR: "color", IMAGE: "image", ARRAY: "array", OBJECT: "object" };

const PORT_COLORS: Record<string, string> = {
  [TYPES.NUMBER]: T.cyan,
  [TYPES.STRING]: T.orange,
  [TYPES.COLOR]: T.pink,
  [TYPES.ARRAY]: T.red,
  [TYPES.OBJECT]: T.textSub,
  [TYPES.ANY]: T.text,
};

const mkPort = (id: string, label: string, type: string, dir: string, defaultVal: any = null) => ({ id, label, type, dir, defaultVal });

const NODE_DEFS: any = {
  add: {
    cat: "Math", label: "Add", color: T.cyan,
    ports: [mkPort("a", "A", TYPES.NUMBER, PORT.IN, 0), mkPort("b", "B", TYPES.NUMBER, PORT.IN, 0), mkPort("out", "Out", TYPES.NUMBER, PORT.OUT)],
    compute: ({ a = 0, b = 0 }: any) => ({ out: Number(a) + Number(b) }),
  },
  subtract: {
    cat: "Math", label: "Subtract", color: T.cyan,
    ports: [mkPort("a", "A", TYPES.NUMBER, PORT.IN, 0), mkPort("b", "B", TYPES.NUMBER, PORT.IN, 0), mkPort("out", "Out", TYPES.NUMBER, PORT.OUT)],
    compute: ({ a = 0, b = 0 }: any) => ({ out: Number(a) - Number(b) }),
  },
  multiply: {
    cat: "Math", label: "Multiply", color: T.cyan,
    ports: [mkPort("a", "A", TYPES.NUMBER, PORT.IN, 1), mkPort("b", "B", TYPES.NUMBER, PORT.IN, 1), mkPort("out", "Out", TYPES.NUMBER, PORT.OUT)],
    compute: ({ a = 1, b = 1 }: any) => ({ out: Number(a) * Number(b) }),
  },
  number: {
    cat: "Input", label: "Number", color: T.orange,
    ports: [mkPort("out", "Value", TYPES.NUMBER, PORT.OUT)],
    hasInput: true, inputType: "number", defaultVal: 0,
    compute: (_: any, { value = 0 }: any) => ({ out: parseFloat(value) || 0 }),
  },
  slider: {
    cat: "Input", label: "Slider", color: T.orange,
    ports: [mkPort("out", "Value", TYPES.NUMBER, PORT.OUT)],
    hasInput: true, inputType: "range", defaultVal: 50,
    compute: (_: any, { value = 50 }: any) => ({ out: parseFloat(value) || 0 }),
  },
  time: {
    cat: "Input", label: "Time", color: T.orange,
    ports: [mkPort("out", "T (sec)", TYPES.NUMBER, PORT.OUT), mkPort("sin", "Sin(T)", TYPES.NUMBER, PORT.OUT)],
    compute: () => { const t = Date.now() / 1000; return { out: t, sin: Math.sin(t) }; },
  },
  circle: {
    cat: "Shape", label: "Circle", color: T.purple,
    ports: [
      mkPort("cx", "CX", TYPES.NUMBER, PORT.IN, 100), mkPort("cy", "CY", TYPES.NUMBER, PORT.IN, 100),
      mkPort("r", "Radius", TYPES.NUMBER, PORT.IN, 40), mkPort("fill", "Fill", TYPES.COLOR, PORT.IN, "#ff2d6b"),
      mkPort("out", "SVG", TYPES.STRING, PORT.OUT),
    ],
    compute: ({ cx = 100, cy = 100, r = 40, fill = "#ff2d6b" }: any) => ({
      out: `<circle cx="${cx}" cy="${cy}" r="${Math.max(0, r)}" fill="${fill}" />`,
    }),
  },
  group: {
    cat: "Shape", label: "Group", color: T.purple,
    ports: [
      mkPort("in1", "Item 1", TYPES.STRING, PORT.IN, ""), mkPort("in2", "Item 2", TYPES.STRING, PORT.IN, ""),
      mkPort("x", "X Offset", TYPES.NUMBER, PORT.IN, 0), mkPort("y", "Y Offset", TYPES.NUMBER, PORT.IN, 0),
      mkPort("out", "SVG", TYPES.STRING, PORT.OUT),
    ],
    compute: ({ in1 = "", in2 = "", x = 0, y = 0 }: any) => ({
      out: `<g transform="translate(${x},${y})">${in1}${in2}</g>`,
    }),
  },
  colorPicker: {
    cat: "Input", label: "Color", color: T.pink,
    ports: [mkPort("out", "Color", TYPES.COLOR, PORT.OUT)],
    hasInput: true, inputType: "color", defaultVal: "#ff2d6b",
    compute: (_: any, { value = "#ff2d6b" }: any) => ({ out: value }),
  },
  display: {
    cat: "Output", label: "Display", color: T.blue,
    ports: [mkPort("in", "Value", TYPES.ANY, PORT.IN)],
    displayNode: true,
    compute: ({ in: val }: any) => ({ out: val }),
  },
};

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════
const newNode = (type: string, x: number, y: number) => {
  const def = NODE_DEFS[type];
  if (!def) return null;
  return {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type, x, y, w: 180, selected: false,
    value: def.defaultVal,
  };
};

const portY = (node: any, portId: string, side: "in" | "out") => {
  const def = NODE_DEFS[node.type];
  const ports = def.ports.filter((p: any) => p.dir === side);
  const idx = ports.findIndex((p: any) => p.id === portId);
  return node.y + 34 + idx * 22 + 11;
};
const portX = (node: any, portId: string, side: "in" | "out") => (side === "in" ? node.x : node.x + (node.w || 180));

const edgePath = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.abs(x2 - x1) * 0.55;
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
};

const fmtVal = (v: any) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Math.abs(v) < 1000 ? v.toFixed(2).replace(/\.?0+$/, "") : v.toFixed(0);
  if (typeof v === "string" && !v.startsWith("<")) return v.length > 20 ? v.slice(0, 20) + "…" : v;
  return String(v);
};

// ═══════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function NodeComp({ node, state, dispatch, computedVals, onPortDown }: any) {
  const def = NODE_DEFS[node.type];
  const isSel = state.selNodes.includes(node.id);
  const vals = computedVals[node.id] || {};
  const inPorts = def.ports.filter((p: any) => p.dir === PORT.IN);
  const outPorts = def.ports.filter((p: any) => p.dir === PORT.OUT);
  
  let totalH = 34 + Math.max(inPorts.length, outPorts.length) * 22 + 10;
  if (def.hasInput) totalH += 34;
  if (def.displayNode) totalH += 120;

  return (
    <g transform={`translate(${node.x},${node.y})`}>
      <rect x={0} y={0} width={node.w} height={totalH} rx={6} fill="#0d001a" stroke={isSel ? def.color : "#2a2a2a"} strokeWidth={isSel ? 2 : 1}
        onPointerDown={(e) => { e.stopPropagation(); dispatch({ type: "START_DRAG", dragType: "node", id: node.id, x: e.clientX, y: e.clientY }); }}
        className="cursor-move shadow-2xl drop-shadow-2xl"
      />
      <rect x={0} y={0} width={node.w} height={34} rx={6} fill={`${def.color}20`} pointerEvents="none" />
      <text x={12} y={22} fill={def.color} fontSize="12" fontWeight="bold" pointerEvents="none">{def.label}</text>
      
      {def.hasInput && (
        <foreignObject x={12} y={totalH - 42} width={node.w - 24} height={30} onPointerDown={(e)=>e.stopPropagation()}>
          {def.inputType === "range" ? (
            <input type="range" className="w-full h-full accent-[var(--primary)]" min="0" max="100" value={node.value} onChange={(e) => dispatch({ type: "NODE_UPD", id: node.id, p: { value: e.target.value } })} />
          ) : def.inputType === "color" ? (
            <input type="color" className="w-full h-8 rounded bg-transparent border-0 cursor-pointer" value={node.value} onChange={(e) => dispatch({ type: "NODE_UPD", id: node.id, p: { value: e.target.value } })} />
          ) : (
            <input type={def.inputType} className="w-full h-8 bg-black/40 border border-white/10 rounded px-2 text-xs text-white outline-none focus:border-[var(--primary)]" value={node.value} onChange={(e) => dispatch({ type: "NODE_UPD", id: node.id, p: { value: e.target.value } })} />
          )}
        </foreignObject>
      )}

      {def.displayNode && (
        <foreignObject x={12} y={totalH - 126} width={node.w - 24} height={116} onPointerDown={(e)=>e.stopPropagation()}>
           <div className="w-full h-full bg-black/40 border border-white/10 rounded flex items-center justify-center p-2 text-xs text-white/70 overflow-hidden break-all">
             {vals.out && typeof vals.out === 'string' && vals.out.startsWith('<') ? (
               <svg viewBox="0 0 200 200" width="100%" height="100%" dangerouslySetInnerHTML={{ __html: vals.out }} />
             ) : (
               <span>{fmtVal(vals.out)}</span>
             )}
           </div>
        </foreignObject>
      )}

      {inPorts.map((p: any, i: number) => {
        const py = 34 + i * 22 + 11;
        const px = 0;
        const connected = state.edges.some((e: any) => e.to === node.id && e.toPort === p.id);
        const pval = vals[p.id];
        return (
          <g key={p.id}>
            <circle cx={px} cy={py} r={6} fill={connected ? PORT_COLORS[p.type] : "#0d001a"} stroke={PORT_COLORS[p.type]} strokeWidth="1.5"
              className="cursor-crosshair transition-all hover:scale-150"
              onPointerDown={(e) => { e.stopPropagation(); onPortDown(node.id, p.id, "in", node.x + px, node.y + py, p.type); }}
              onPointerEnter={() => dispatch({ type: "HOVER_PORT", port: { nodeId: node.id, portId: p.id, side: "in" } })}
              onPointerLeave={() => dispatch({ type: "HOVER_PORT", port: null })}
            />
            <text x={px + 12} y={py + 4} fill="#999" fontSize="10" pointerEvents="none">{p.label} <tspan fill="#666">{pval !== undefined && !connected ? `(${fmtVal(pval)})`:''}</tspan></text>
          </g>
        );
      })}

      {outPorts.map((p: any, i: number) => {
        const py = 34 + i * 22 + 11;
        const px = node.w;
        const pval = vals[p.id];
        return (
          <g key={p.id}>
            <circle cx={px} cy={py} r={6} fill={PORT_COLORS[p.type]} stroke="#1c1c1c" strokeWidth="1"
              className="cursor-crosshair transition-all hover:scale-150"
              onPointerDown={(e) => { e.stopPropagation(); onPortDown(node.id, p.id, "out", node.x + px, node.y + py, p.type); }}
              onPointerEnter={() => dispatch({ type: "HOVER_PORT", port: { nodeId: node.id, portId: p.id, side: "out" } })}
              onPointerLeave={() => dispatch({ type: "HOVER_PORT", port: null })}
            />
            <text x={px - 12} y={py + 4} fill="#999" fontSize="10" textAnchor="end" pointerEvents="none">{p.label}</text>
            {!def.displayNode && pval !== undefined && (
               <text x={px + 12} y={py + 4} fill="#666" fontSize="9" pointerEvents="none">{fmtVal(pval)}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CORE CANVAS LOGIC
// ═══════════════════════════════════════════════════════════════════
function reducer(s: any, a: any) {
  switch (a.type) {
    case "NODE_ADD": return { ...s, nodes: [...s.nodes, a.node] };
    case "NODE_UPD": return { ...s, nodes: s.nodes.map((n: any) => n.id === a.id ? { ...n, ...a.p } : n) };
    case "NODE_DEL": return { ...s, nodes: s.nodes.filter((n:any)=>!s.selNodes.includes(n.id)), edges: s.edges.filter((e:any)=>!s.selNodes.includes(e.from) && !s.selNodes.includes(e.to)), selNodes: [] };
    case "EDGE_ADD": 
      // replace existing incoming edge to a port
      const edges = s.edges.filter((e:any) => !(e.to === a.edge.to && e.toPort === a.edge.toPort));
      return { ...s, edges: [...edges, a.edge], connecting: null };
    case "SEL": return { ...s, selNodes: a.ids };
    
    // Interactions
    case "START_DRAG": return { ...s, drag: { type: a.dragType, id: a.id, sx: a.x, sy: a.y, ix: s.nodes.find((n:any)=>n.id===a.id)?.x || 0, iy: s.nodes.find((n:any)=>n.id===a.id)?.y || 0, ipx: s.pan.x, ipy: s.pan.y }, selNodes: a.id ? [a.id] : [] };
    case "DRAG_MOVE":
      if (!s.drag) return s;
      if (s.drag.type === "node") {
         const dx = (a.x - s.drag.sx) / s.zoom;
         const dy = (a.y - s.drag.sy) / s.zoom;
         return { ...s, nodes: s.nodes.map((n:any) => n.id === s.drag.id ? { ...n, x: s.drag.ix + dx, y: s.drag.iy + dy } : n) };
      }
      if (s.drag.type === "pan") {
         return { ...s, pan: { x: s.drag.ipx + (a.x - s.drag.sx), y: s.drag.ipy + (a.y - s.drag.sy) } };
      }
      return s;
    case "END_DRAG": return { ...s, drag: null };
    
    case "START_CONNECT": return { ...s, connecting: { ...a.data, curX: a.data.x, curY: a.data.y } };
    case "MOVE_CONNECT": return { ...s, connecting: s.connecting ? { ...s.connecting, curX: a.x, curY: a.y } : null };
    case "END_CONNECT": return { ...s, connecting: null };
    case "HOVER_PORT": return { ...s, hoverPort: a.port };
    
    case "ZOOM": return { ...s, zoom: Math.max(0.2, Math.min(2, s.zoom + a.delta)) };
    default: return s;
  }
}

export default function CanvasStudio() {
  const [state, dispatch] = useReducer(reducer, { nodes: [], edges: [], pan: { x: 0, y: 0 }, zoom: 1, selNodes: [], drag: null, connecting: null, hoverPort: null });
  const [computedVals, setComputedVals] = useState<Record<string,any>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") dispatch({ type: "NODE_DEL" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Compute Engine Loop
  useEffect(() => {
    let frame: number;
    const computeGraph = () => {
      const vals: any = {};
      
      const inDegree: Record<string, number> = {};
      const adj: Record<string, string[]> = {};
      
      state.nodes.forEach((n: any) => { inDegree[n.id] = 0; adj[n.id] = []; });
      state.edges.forEach((e: any) => {
         if(inDegree[e.to] !== undefined) inDegree[e.to]++;
         if(adj[e.from]) adj[e.from].push(e.to);
      });
      
      const queue: string[] = [];
      Object.keys(inDegree).forEach(id => { if (inDegree[id] === 0) queue.push(id); });
      
      const sorted: string[] = [];
      while(queue.length > 0) {
         const curr = queue.shift()!;
         sorted.push(curr);
         if(adj[curr]) {
           adj[curr].forEach(next => {
              inDegree[next]--;
              if (inDegree[next] === 0) queue.push(next);
           });
         }
      }
      
      sorted.forEach(nodeId => {
         const node = state.nodes.find((n:any)=>n.id === nodeId);
         if (!node) return;
         const def = NODE_DEFS[node.type];
         if (!def) return;
         
         const inputs: any = {};
         const inPorts = def.ports.filter((p:any)=>p.dir==="in");
         inPorts.forEach((p:any) => {
             const edge = state.edges.find((e:any)=>e.to===node.id && e.toPort===p.id);
             if (edge && vals[edge.from]) {
                  inputs[p.id] = vals[edge.from][edge.fromPort];
             } else {
                  inputs[p.id] = p.defaultVal;
             }
         });
         
         try {
           vals[node.id] = def.compute(inputs, { value: node.value, ...node });
         } catch(e) {
           vals[node.id] = { out: "Error" };
         }
      });
      
      setComputedVals(vals);
      
      if (state.nodes.some((n:any)=>n.type==="time")) {
         frame = requestAnimationFrame(computeGraph);
      }
    };
    
    computeGraph();
    
    return () => { if(frame) cancelAnimationFrame(frame); };
  }, [state.nodes, state.edges]);

  const onAdd = (type: string) => {
    const cx = (-state.pan.x + window.innerWidth/2) / state.zoom;
    const cy = (-state.pan.y + window.innerHeight/2 - 100) / state.zoom;
    const n = newNode(type, cx, cy);
    if (n) dispatch({ type: "NODE_ADD", node: n });
  };

  const getPos = (e: React.PointerEvent) => {
     if(!svgRef.current) return {x:0,y:0};
     const rect = svgRef.current.getBoundingClientRect();
     return { x: (e.clientX - rect.left - state.pan.x)/state.zoom, y: (e.clientY - rect.top - state.pan.y)/state.zoom };
  };

  const onPointerDown = (e: React.PointerEvent) => {
     if(e.button !== 0) return; // only left click
     if(e.target === svgRef.current) {
        dispatch({ type: "START_DRAG", dragType: "pan", x: e.clientX, y: e.clientY });
        dispatch({ type: "SEL", ids: [] });
     }
  };

  const onPointerMove = (e: React.PointerEvent) => {
     if (state.drag) {
        dispatch({ type: "DRAG_MOVE", x: e.clientX, y: e.clientY });
     }
     if (state.connecting) {
        const {x, y} = getPos(e);
        dispatch({ type: "MOVE_CONNECT", x, y });
     }
  };

  const onPointerUp = (e: React.PointerEvent) => {
     if (state.drag) dispatch({ type: "END_DRAG" });
     if (state.connecting) {
        if (state.hoverPort && state.hoverPort.nodeId !== state.connecting.nodeId && state.hoverPort.side !== state.connecting.side) {
           const fromSide = state.connecting.side === "out" ? state.connecting : state.hoverPort;
           const toSide = state.connecting.side === "in" ? state.connecting : state.hoverPort;
           dispatch({ 
             type: "EDGE_ADD", 
             edge: { id: `e_${Date.now()}`, from: fromSide.nodeId, fromPort: fromSide.portId, to: toSide.nodeId, toPort: toSide.portId } 
           });
        } else {
           dispatch({ type: "END_CONNECT" });
        }
     }
  };

  const onWheel = (e: React.WheelEvent) => {
     e.preventDefault();
     dispatch({ type: "ZOOM", delta: e.deltaY * -0.001 });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full bg-[#06000f] overflow-hidden select-none"
    >
      <div className="flex items-center gap-4 px-4 h-12 border-b border-[#1c1c1c] z-10 glass shadow-md">
        <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
           NODE DESIGNER
        </h2>
        <div className="mx-2 w-px h-6 bg-white/10" />
        <div className="flex gap-2 flex-wrap max-h-12 overflow-hidden items-center">
          {Object.keys(NODE_DEFS).map(k => (
            <button key={k} onClick={() => onAdd(k)} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 rounded border border-[#2a2a2a] transition-colors shadow">
              + {NODE_DEFS[k].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 text-[10px] text-white/40">
           <span>Drag bg to pan</span>
           <span>Drag node to move</span>
           <span>Connect ports</span>
           <span>[DEL] Remove selected</span>
        </div>
      </div>

      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          style={{ background: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 20px 20px #06000f` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          <g transform={`translate(${state.pan.x},${state.pan.y}) scale(${state.zoom})`}>
            {/* Edges */}
            {state.edges.map((e: any) => {
              const from = state.nodes.find((n: any) => n.id === e.from);
              const to = state.nodes.find((n: any) => n.id === e.to);
              if (!from || !to) return null;
              const x1 = portX(from, e.fromPort, "out"); const y1 = portY(from, e.fromPort, "out");
              const x2 = portX(to, e.toPort, "in"); const y2 = portY(to, e.toPort, "in");
              return (
                 <motion.path 
                   key={e.id} d={edgePath(x1, y1, x2, y2)} fill="none" stroke="var(--primary)" strokeWidth="2"
                   initial={{ pathLength: 0, opacity: 0 }}
                   animate={{ pathLength: 1, opacity: 1 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                 />
              );
            })}
            
            {/* Connecting Edge */}
            {state.connecting && (
              <path 
                 d={edgePath(
                    state.connecting.side === "out" ? state.connecting.x : state.connecting.curX, 
                    state.connecting.side === "out" ? state.connecting.y : state.connecting.curY, 
                    state.connecting.side === "in" ? state.connecting.x : state.connecting.curX, 
                    state.connecting.side === "in" ? state.connecting.y : state.connecting.curY
                 )} 
                 fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" 
              />
            )}

            {/* Nodes */}
            {state.nodes.map((n: any) => (
              <NodeComp 
                 key={n.id} node={n} state={state} dispatch={dispatch} computedVals={computedVals} 
                 onPortDown={(nid:string, pid:string, side:string, x:number, y:number) => {
                    dispatch({ type: "START_CONNECT", data: { nodeId: nid, portId: pid, side, x, y } });
                 }} 
              />
            ))}
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
