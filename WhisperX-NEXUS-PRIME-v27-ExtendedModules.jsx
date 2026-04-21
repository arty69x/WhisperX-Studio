/**
 * WhisperX NEXUS PRIME v27 — Extended Development Guide
 * Extended Module Pack v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * DROP-IN additions for WhisperX-NEXUS-PRIME-v27 (BLOOM × OMEGA FUSION)
 *
 * NEW MODULES (8):
 *   · TeamView         — Sparkline perf grid + heatmap calendar
 *   · SWOTView         — AI-generated 4-quadrant strategic matrix
 *   · MermaidView      — NL-to-diagram with AI preset injection
 *   · KickoffView      — Phase-gated checklist + AI goal suggestion
 *   · AnalyticsView    — Real-time KPI tiles + burn-down chart
 *   · ExportView       — PDF/JSON/Markdown multi-format export hub
 *   · ReaderView       — Block-level document deep-reader with trace
 *   · SettingsView     — Config panel with tier overrides & API health
 *
 * UPDATED TAXONOMY ENTRIES (merge into TAXONOMY array):
 *   · "AI Suite" workflow additions: mermaid, reader
 *   · "Analytics" workflow additions: analytics, swot
 *   · "Operations" workflow additions: team, kickoff, export
 *   · "Infrastructure" workflow additions: settings
 *
 * UPDATED ACCESS MAP (merge into ACCESS object):
 *   mermaid:1, reader:1, analytics:1, swot:2,
 *   team:2, kickoff:2, export:2, settings:3
 *
 * USAGE:
 *   1. Paste this file alongside your main app file.
 *   2. Import the views you want:
 *        import { TeamView, SWOTView, MermaidView, KickoffView,
 *                 AnalyticsView, ExportView, ReaderView, SettingsView }
 *          from "./WhisperX-NEXUS-PRIME-v27-ExtendedModules";
 *   3. Merge EXTENDED_ACCESS into ACCESS and EXTENDED_TAXONOMY into TAXONOMY.
 *   4. Add the new entries to the VIEWS map in your root component.
 *   5. Merge EXTENDED_INIT_STATE into initState (spread at the bottom).
 *   6. Add EXTENDED_REDUCER_CASES into the reducer switch block.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo, useReducer,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Zap, Database, X, FileSearch, Trash2, Download,
  Terminal, Copy, CheckCheck, ChevronDown, ChevronRight, ChevronLeft,
  FileUp, Activity, Cpu, CheckCircle2, AlertTriangle, Code2,
  SquareTerminal, HardDrive, Globe, History, Workflow, FileCode,
  ShieldCheck, BookOpen, AlertCircle, Eye, EyeOff,
  Maximize2, Minimize2, GitMerge, Search, Network, LayoutDashboard,
  Users, DollarSign, FileText, Monitor, Archive, Layers,
  Plus, Minus, ZoomIn, ZoomOut, Box, BarChart2,
  TrendingUp, Star, Clock, Settings, RefreshCw, Lock, Unlock,
  XCircle, Lightbulb, Target, PieChart, Calendar, Inbox,
  FolderOpen, Folder, Tag, Filter, SlidersHorizontal,
  Circle, Square, Diamond, Triangle, Hexagon, Octagon,
  ArrowRight, ArrowLeft, ArrowUpDown, Share2, Link2,
  Brain, Cloud, Server, Router, Wifi, Shield, Key,
  BarChart, Table, Image, Music, Video, Map, Compass,
  Bug, TestTube, Rocket, Package, GitBranch, Repeat,
  Play, Pause, StopCircle, FastForward, Rewind,
  MessageSquare, Mail, Phone, Globe2, AtSign,
  User, UserCheck, UserPlus, LogIn, LogOut, Upload,
  Braces, Hash, Save, Camera, ChevronUp, Info,
  CornerDownRight, TrendingDown, Award, RotateCcw,
} from "lucide-react";

// ─── Re-export design tokens so modules are self-contained ────────────────────
// These mirror the G / MODEL / callAI from the main app.
// When integrated, the main app's symbols take precedence via the shared import.

export const G = {
  bgGrad: "linear-gradient(150deg,#06000f 0%,#0d0018 35%,#060012 65%,#020008 100%)",
  bg: "#06000f", bgAlt: "#0d0018", bgElev: "#110020", bgPanel: "#160028",
  glass: "rgba(255,255,255,0.055)", glassMd: "rgba(255,255,255,0.09)",
  glassHi: "rgba(255,255,255,0.14)", glassDark: "rgba(0,0,0,0.45)",
  glassDeep: "rgba(4,0,12,0.80)",
  rose: "#ff2d6b", roseDim: "rgba(255,45,107,0.15)",
  pink: "#ff6fa0", pinkDim: "rgba(255,111,160,0.10)",
  violet: "#8b00ff", violetDim: "rgba(139,0,255,0.14)",
  lav: "#b06aff", lavDim: "rgba(176,106,255,0.12)",
  emerald: "#00f0a0", emeraldDim: "rgba(0,240,160,0.10)",
  amber: "#ffca30", amberDim: "rgba(255,202,48,0.10)",
  cyan: "#00d8ff", cyanDim: "rgba(0,216,255,0.08)",
  blue: "#3d88ff", blueDim: "rgba(61,136,255,0.10)",
  red: "#ff3355", gold: "#ffd060",
  text: "#fef0f7", muted: "rgba(255,200,230,0.38)", dim: "rgba(255,190,220,0.16)",
  border: "rgba(255,255,255,0.09)", borderHi: "rgba(255,255,255,0.22)",
  borderRose: "rgba(255,45,107,0.30)", borderViolet: "rgba(139,0,255,0.30)",
  borderGold: "rgba(255,208,96,0.28)",
  fDisp: "'Playfair Display', serif", fBody: "'DM Sans', sans-serif",
  fMono: "'JetBrains Mono', monospace", fSyne: "'Syne', sans-serif",
};

export const MODEL = "claude-sonnet-4-20250514";

export async function callAI(messages, system) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 1000, system, messages }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content.find((b) => b.type === "text")?.text || "";
}

// ─── Shared primitives (mirrors main app) ────────────────────────────────────

export const GCard = ({ children, style = {}, hue = "" }) => {
  const bd =
    hue === "rose"
      ? G.borderRose
      : hue === "violet"
      ? G.borderViolet
      : hue === "gold"
      ? G.borderGold
      : G.border;
  const bg =
    hue === "rose"
      ? "rgba(255,45,107,0.06)"
      : hue === "violet"
      ? "rgba(139,0,255,0.07)"
      : hue === "gold"
      ? "rgba(255,202,48,0.06)"
      : G.glass;
  return (
    <div
      style={{
        background: `linear-gradient(145deg,${bg},rgba(255,255,255,0.025))`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${bd}`,
        borderRadius: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const GBtn = ({
  children, onClick, style = {}, accent = false, disabled = false, sm = false,
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    style={{
      background: accent
        ? "linear-gradient(135deg,#ff2d6b,#8b00ff)"
        : `linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))`,
      border: `1px solid ${accent ? G.borderRose : G.border}`,
      borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      color: G.text,
      fontFamily: G.fBody,
      fontWeight: 700,
      fontSize: sm ? 10 : 11,
      padding: sm ? "5px 11px" : "8px 16px",
      display: "flex",
      alignItems: "center",
      gap: 5,
      opacity: disabled ? 0.38 : 1,
      ...style,
    }}
  >
    {children}
  </motion.button>
);

export const Chip = ({ children, color = G.rose }) => (
  <span
    style={{
      padding: "2px 8px",
      borderRadius: 99,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      fontSize: 9,
      fontWeight: 800,
      fontFamily: G.fMono,
      color,
    }}
  >
    {children}
  </span>
);

export const StatusDot = ({ color = G.emerald, pulse = false }) => (
  <span
    style={{
      position: "relative",
      width: 7,
      height: 7,
      display: "inline-block",
      flexShrink: 0,
    }}
  >
    {pulse && (
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.45,
          animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />
    )}
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  </span>
);

// ─── Extended Access Map ──────────────────────────────────────────────────────
// Merge this into the main ACCESS object in your app.
export const EXTENDED_ACCESS = {
  mermaid: 1,
  reader: 1,
  analytics: 1,
  swot: 2,
  team: 2,
  kickoff: 2,
  export: 2,
  settings: 3,
};

// ─── Extended Initial State ───────────────────────────────────────────────────
// Spread this at the bottom of initState in your app.
export const EXTENDED_INIT_STATE = {
  teamMembers: [
    {
      id: "tm1", name: "Assadawut P.", role: "Lead Dev",
      perf: 94, tasks: 14, done: 13,
      trend: [78, 80, 82, 86, 90, 94],
      avatar: "AP", color: "#ff2d6b",
    },
    {
      id: "tm2", name: "System AI", role: "Evolution Engine",
      perf: 99, tasks: 9999, done: 9999,
      trend: [97, 98, 98, 99, 99, 99],
      avatar: "AI", color: "#8b00ff",
    },
  ],
  swotData: {
    strengths: ["Claude Sonnet 4 integration", "56-node canvas engine", "4-tier auth system"],
    weaknesses: ["No persistent backend yet", "PDF export placeholder", "Limited mobile UI"],
    opportunities: ["MCP tool server integration", "Real-time collaboration", "Plugin marketplace"],
    threats: ["API rate limits under heavy load", "Browser storage caps", "Competitor platforms"],
  },
  mermaidCode: `graph TD
  A[NEXUS PRIME] --> B{Auth Gate}
  B -->|Tier 2| C[Evolution Forge]
  B -->|Tier 0| D[Overview]
  C --> E[AI Analysis]
  C --> F[Vault]
  E --> G[Archive]
  F --> G`,
  kickoffItems: [
    { id: "k1", phase: "Pre-Launch", item: "Auth tiers validated", done: true, ai: false },
    { id: "k2", phase: "Pre-Launch", item: "Canvas engine stress-tested", done: true, ai: false },
    { id: "k3", phase: "Pre-Launch", item: "Claude API key provisioned", done: false, ai: false },
    { id: "k4", phase: "Launch", item: "Deploy to production CDN", done: false, ai: false },
    { id: "k5", phase: "Launch", item: "Smoke test all 15 modules", done: false, ai: true },
    { id: "k6", phase: "Post-Launch", item: "Monitor evolution error rate", done: false, ai: true },
    { id: "k7", phase: "Post-Launch", item: "Collect user feedback", done: false, ai: false },
  ],
  analyticsFilter: "7d",
  settingsConfig: {
    apiModel: "claude-sonnet-4-20250514",
    maxTokens: 1000,
    theme: "nexus-prime",
    sidebarMode: "taxonomy",
    enableAnimations: true,
    debugMode: false,
  },
};

// ─── Extended Reducer Cases ───────────────────────────────────────────────────
// Add these cases inside your reducer switch block.
export function extendedReducer(state, action) {
  switch (action.type) {
    case "TEAM_ADD":
      return { ...state, teamMembers: [action.member, ...state.teamMembers] };
    case "TEAM_UPDATE":
      return {
        ...state,
        teamMembers: state.teamMembers.map((m) =>
          m.id === action.id ? { ...m, ...action.patch } : m
        ),
      };
    case "TEAM_DELETE":
      return { ...state, teamMembers: state.teamMembers.filter((m) => m.id !== action.id) };
    case "SWOT_UPDATE":
      return { ...state, swotData: { ...state.swotData, [action.key]: action.items } };
    case "MERMAID_SET":
      return { ...state, mermaidCode: action.code };
    case "KICKOFF_TOGGLE":
      return {
        ...state,
        kickoffItems: state.kickoffItems.map((k) =>
          k.id === action.id ? { ...k, done: !k.done } : k
        ),
      };
    case "KICKOFF_ADD":
      return { ...state, kickoffItems: [...state.kickoffItems, action.item] };
    case "KICKOFF_DELETE":
      return { ...state, kickoffItems: state.kickoffItems.filter((k) => k.id !== action.id) };
    case "ANALYTICS_FILTER":
      return { ...state, analyticsFilter: action.filter };
    case "SETTINGS_UPDATE":
      return {
        ...state,
        settingsConfig: { ...state.settingsConfig, ...action.patch },
      };
    default:
      return state;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 1 — TEAM VIEW
// Sparkline performance grid with 6-period trend bars, workload heatmap,
// and inline add-member form.
// ═════════════════════════════════════════════════════════════════════════════

export function TeamView({ state, dispatch, toast }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", avatar: "", color: G.rose });
  const members = state.teamMembers || EXTENDED_INIT_STATE.teamMembers;

  const PERF_COLOR = (p) =>
    p >= 90 ? G.emerald : p >= 75 ? G.amber : G.red;

  const addMember = () => {
    if (!form.name) return;
    dispatch({
      type: "TEAM_ADD",
      member: {
        id: `tm${Date.now()}`,
        ...form,
        perf: 80,
        tasks: 0,
        done: 0,
        trend: [70, 72, 74, 76, 78, 80],
      },
    });
    setForm({ name: "", role: "", avatar: "", color: G.rose });
    setAdding(false);
    toast("Team member added");
  };

  // Mini sparkline component
  const Sparkline = ({ data, color }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 72;
    const h = 22;
    const pts = data
      .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
      .join(" ");
    return (
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <polyline
          points={pts}
          fill="none"
          stroke={`url(#sg-${color.replace("#", "")})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* last dot */}
        {data.length > 0 && (
          <circle
            cx={(data.length - 1) / (data.length - 1) * w}
            cy={h - ((data[data.length - 1] - min) / range) * h}
            r="3"
            fill={color}
          />
        )}
      </svg>
    );
  };

  const avgPerf = members.length
    ? Math.round(members.reduce((s, m) => s + m.perf, 0) / members.length)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text, marginBottom: 4 }}>
            Team
          </h1>
          <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fMono }}>
            {members.length} members · avg performance{" "}
            <span style={{ color: PERF_COLOR(avgPerf) }}>{avgPerf}%</span>
          </p>
        </div>
        <GBtn onClick={() => setAdding((a) => !a)} sm accent={adding}>
          <UserPlus size={11} />{adding ? "Cancel" : "Add Member"}
        </GBtn>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { l: "Team Size", v: members.length, c: G.pink },
          { l: "Avg Perf", v: `${avgPerf}%`, c: PERF_COLOR(avgPerf) },
          { l: "Total Tasks", v: members.reduce((s, m) => s + (m.tasks < 9999 ? m.tasks : 0), 0), c: G.cyan },
          { l: "Completion", v: members.filter((m) => m.tasks < 9999).length
              ? `${Math.round((members.filter(m => m.tasks < 9999).reduce((s, m) => s + m.done, 0) /
                 members.filter(m => m.tasks < 9999).reduce((s, m) => s + m.tasks, 1)) * 100)}%`
              : "—", c: G.emerald },
        ].map(({ l, v, c }) => (
          <GCard key={l} style={{ padding: "12px 14px" }}>
            <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fBody, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {l}
            </p>
            <p style={{ fontSize: 22, fontWeight: 900, fontFamily: G.fSyne, color: c }}>{v}</p>
          </GCard>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <GCard hue="rose" style={{ padding: "16px" }}>
              <p style={{ fontSize: 9, fontWeight: 900, color: G.rose, fontFamily: G.fSyne, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
                New Team Member
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 12 }}>
                {[["name", "Full Name"], ["role", "Role"], ["avatar", "Initials"]].map(([k, lbl]) => (
                  <div key={k}>
                    <p style={{ fontSize: 9, color: G.muted, marginBottom: 4, fontFamily: G.fBody, fontWeight: 700 }}>{lbl}</p>
                    <input
                      value={form[k]}
                      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                      placeholder={lbl}
                      style={{
                        width: "100%", background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${G.border}`, borderRadius: 8,
                        padding: "7px 10px", color: G.text, fontSize: 11,
                        fontFamily: G.fBody, outline: "none",
                      }}
                    />
                  </div>
                ))}
              </div>
              <GBtn accent onClick={addMember}>
                <Plus size={11} />Add to Team
              </GBtn>
            </GCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {members.map((m) => (
          <GCard key={m.id} style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg,${m.color}30,${m.color}10)`,
                border: `1.5px solid ${m.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: m.color, flexShrink: 0,
                fontFamily: G.fSyne,
              }}>
                {m.avatar || m.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 800, fontFamily: G.fBody, color: G.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.name}
                </p>
                <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody }}>{m.role}</p>
              </div>
              <button
                onClick={() => dispatch({ type: "TEAM_DELETE", id: m.id })}
                style={{ background: "none", border: "none", cursor: "pointer", color: G.dim, padding: 4 }}
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Performance row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 2 }}>PERFORMANCE TREND</p>
                <Sparkline data={m.trend} color={PERF_COLOR(m.perf)} />
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 26, fontWeight: 900, fontFamily: G.fSyne, color: PERF_COLOR(m.perf), lineHeight: 1 }}>
                  {m.perf}%
                </p>
                <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginTop: 2 }}>
                  {m.trend[m.trend.length - 1] > m.trend[0] ? "↑" : "↓"}{" "}
                  {Math.abs(m.trend[m.trend.length - 1] - m.trend[0])}pts
                </p>
              </div>
            </div>

            {/* Task bar */}
            {m.tasks < 9999 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono }}>TASKS</p>
                  <p style={{ fontSize: 9, fontFamily: G.fMono, color: G.text }}>
                    {m.done}/{m.tasks}
                  </p>
                </div>
                <div style={{ height: 4, background: G.glass, borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.tasks ? (m.done / m.tasks) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg,${m.color},${PERF_COLOR(m.perf)})`,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            )}
          </GCard>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 2 — SWOT VIEW
// AI-generated 4-quadrant strategic analysis with live edit + AI regeneration.
// ═════════════════════════════════════════════════════════════════════════════

export function SWOTView({ state, dispatch, toast, setBusy, setBusyMsg }) {
  const swot = state.swotData || EXTENDED_INIT_STATE.swotData;
  const [ctx, setCtx] = useState("WhisperX NEXUS PRIME v27 — AI evolution platform");
  const [editKey, setEditKey] = useState(null);
  const [newItem, setNewItem] = useState("");

  const Q = [
    { key: "strengths", label: "Strengths", color: G.emerald, icon: TrendingUp, hue: "" },
    { key: "weaknesses", label: "Weaknesses", color: G.red, icon: TrendingDown, hue: "rose" },
    { key: "opportunities", label: "Opportunities", color: G.cyan, icon: Star, hue: "" },
    { key: "threats", label: "Threats", color: G.amber, icon: AlertTriangle, hue: "gold" },
  ];

  const genAI = async () => {
    setBusy(true);
    setBusyMsg("GENERATING SWOT…");
    try {
      const sys = `Strategic analyst. Return ONLY valid JSON (no fences): {"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]}`;
      const raw = await callAI(
        [{ role: "user", content: `Generate a sharp, specific SWOT for: "${ctx}"` }],
        sys
      );
      const parsed = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim());
      Object.keys(parsed).forEach((k) =>
        dispatch({ type: "SWOT_UPDATE", key: k, items: parsed[k] })
      );
      toast("SWOT regenerated");
    } catch (e) {
      toast("Error: " + e.message, "error");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  const addItem = (key) => {
    if (!newItem.trim()) return;
    dispatch({ type: "SWOT_UPDATE", key, items: [...(swot[key] || []), newItem.trim()] });
    setNewItem("");
    setEditKey(null);
  };

  const delItem = (key, idx) => {
    dispatch({
      type: "SWOT_UPDATE", key,
      items: (swot[key] || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header + context */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text, marginBottom: 4 }}>
            SWOT Analysis
          </h1>
        </div>
        <GBtn accent onClick={genAI} style={{ flexShrink: 0 }}>
          <Sparkles size={11} />Regenerate with AI
        </GBtn>
      </div>

      {/* Context input */}
      <GCard style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 6 }}>
          ANALYSIS CONTEXT
        </p>
        <input
          value={ctx}
          onChange={(e) => setCtx(e.target.value)}
          placeholder="Describe the subject of analysis…"
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: G.text, fontSize: 12, fontFamily: G.fBody,
          }}
        />
      </GCard>

      {/* 2×2 Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Q.map(({ key, label, color, icon: Icon, hue }) => (
          <GCard key={key} hue={hue} style={{ padding: "16px", minHeight: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{ fontFamily: G.fSyne, fontSize: 11, fontWeight: 800, color }}>{label}</p>
              <button
                onClick={() => setEditKey(editKey === key ? null : key)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 2 }}
              >
                <Plus size={11} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(swot[key] || []).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, marginTop: 5, flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: G.text, fontFamily: G.fBody, flex: 1, lineHeight: 1.5 }}>
                    {item}
                  </p>
                  <button
                    onClick={() => delItem(key, idx)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: G.dim, padding: 2, flexShrink: 0 }}
                  >
                    <X size={9} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Inline add */}
            <AnimatePresence>
              {editKey === key && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      autoFocus
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addItem(key)}
                      placeholder="Add item…"
                      style={{
                        flex: 1, background: "rgba(0,0,0,0.3)", border: `1px solid ${color}40`,
                        borderRadius: 7, padding: "5px 9px", color: G.text,
                        fontSize: 10, fontFamily: G.fBody, outline: "none",
                      }}
                    />
                    <GBtn sm onClick={() => addItem(key)}>Add</GBtn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GCard>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 3 — MERMAID VIEW
// Natural-language → Mermaid diagram AI generator with visual node preview.
// ═════════════════════════════════════════════════════════════════════════════

export function MermaidView({ state, dispatch, toast, setBusy, setBusyMsg }) {
  const code = state.mermaidCode || EXTENDED_INIT_STATE.mermaidCode;
  const [nl, setNl] = useState("");
  const [copied, setCopied] = useState(false);

  const PRESETS = [
    "Authentication flow with multi-factor fallback",
    "Microservices event bus architecture",
    "CI/CD pipeline with rollback strategy",
    "AI evolution pipeline with feedback loop",
    "Data ingestion with error handling",
  ];

  const generate = async (prompt = nl) => {
    if (!prompt.trim()) return;
    setBusy(true);
    setBusyMsg("GENERATING DIAGRAM…");
    try {
      const sys = "Return ONLY valid Mermaid diagram code. No markdown fences. No explanation.";
      const raw = await callAI(
        [{ role: "user", content: `Generate a Mermaid diagram for: "${prompt}"` }],
        sys
      );
      dispatch({ type: "MERMAID_SET", code: raw.replace(/```mermaid\n?|```\n?/g, "").trim() });
      toast("Diagram generated");
    } catch (e) {
      toast("Error: " + e.message, "error");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  // Parse node labels from Mermaid code for visual preview
  const nodes = useMemo(() => {
    const lines = code.split("\n");
    const ns = [];
    lines.forEach((l) => {
      const m = l.match(/([A-Za-z0-9_]+)\[([^\]]+)\]/);
      if (m && ns.length < 12) ns.push({ id: m[1], label: m[2] });
    });
    return ns;
  }, [code]);

  // Parse edges for preview arrows
  const edges = useMemo(() => {
    const lines = code.split("\n");
    const es = [];
    lines.forEach((l) => {
      const m = l.match(/([A-Za-z0-9_]+)\s*--[>|]+\s*(?:\|([^|]+)\|)?\s*([A-Za-z0-9_]+)/);
      if (m && es.length < 12) es.push({ from: m[1], label: m[2] || "", to: m[3] });
    });
    return es;
  }, [code]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text }}>
        Architect Studio
      </h1>

      {/* NL Input */}
      <GCard style={{ padding: "16px" }}>
        <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 8 }}>
          DESCRIBE YOUR DIAGRAM
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            value={nl}
            onChange={(e) => setNl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. 'checkout flow with payment validation and rollback'"
            style={{
              flex: 1, background: "rgba(0,0,0,0.4)", border: `1px solid ${G.border}`,
              borderRadius: 10, padding: "9px 14px", color: G.text,
              fontSize: 11, fontFamily: G.fBody, outline: "none",
            }}
          />
          <GBtn accent onClick={() => generate()} disabled={!nl.trim()}>
            <Sparkles size={11} />Generate
          </GBtn>
        </div>
        {/* Presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, alignSelf: "center" }}>
            PRESETS:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setNl(p); generate(p); }}
              style={{
                fontSize: 9, padding: "4px 10px", borderRadius: 99,
                background: G.glass, border: `1px solid ${G.border}`,
                color: G.muted, cursor: "pointer", fontFamily: G.fBody,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </GCard>

      {/* Editor + Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
        {/* Code editor */}
        <GCard style={{ padding: "14px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono }}>MERMAID CODE</p>
            <GBtn sm onClick={copy}>
              {copied ? <CheckCheck size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy"}
            </GBtn>
          </div>
          <textarea
            value={code}
            onChange={(e) => dispatch({ type: "MERMAID_SET", code: e.target.value })}
            style={{
              flex: 1,
              minHeight: 280,
              width: "100%",
              background: "rgba(1,0,6,0.85)",
              border: `1px solid ${G.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              color: G.lav,
              fontSize: 11,
              fontFamily: G.fMono,
              lineHeight: 1.8,
              resize: "none",
              outline: "none",
            }}
          />
        </GCard>

        {/* Visual preview */}
        <GCard style={{ padding: "14px", overflow: "auto" }}>
          <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 12 }}>
            VISUAL PREVIEW — {nodes.length} nodes · {edges.length} edges
          </p>
          {nodes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {nodes.map((n, i) => {
                const inEdges = edges.filter((e) => e.to === n.id);
                const outEdges = edges.filter((e) => e.from === n.id);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {i > 0 && inEdges.length > 0 && (
                      <div style={{ width: 2, height: 14, background: `linear-gradient(${G.violet},${G.rose})`, borderRadius: 1 }} />
                    )}
                    <div style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: i === 0
                        ? `linear-gradient(135deg,${G.violet},${G.rose})`
                        : G.glassMd,
                      border: `1px solid ${i === 0 ? "transparent" : G.border}`,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#fff" : G.violet }} />
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: G.fBody, color: G.text }}>
                          {n.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 8, fontFamily: G.fMono, color: G.muted }}>{n.id}</span>
                    </div>
                    {outEdges.length > 0 && (
                      <ArrowRight size={10} color={G.violet} style={{ flexShrink: 0 }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", opacity: 0.2 }}>
              <GitBranch size={36} color={G.muted} style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ fontFamily: G.fBody, color: G.muted, fontSize: 12 }}>
                Describe a diagram above to preview
              </p>
            </div>
          )}
          <p style={{ fontSize: 8, color: G.dim, fontFamily: G.fMono, marginTop: 14, textAlign: "center" }}>
            Visual approximation — paste code at mermaid.live for full render
          </p>
        </GCard>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 4 — KICKOFF VIEW
// Phase-gated checklist with AI goal suggestion and completion tracking.
// ═════════════════════════════════════════════════════════════════════════════

export function KickoffView({ state, dispatch, toast, setBusy, setBusyMsg }) {
  const items = state.kickoffItems || EXTENDED_INIT_STATE.kickoffItems;
  const [suggestions, setSuggestions] = useState([]);
  const [addPhase, setAddPhase] = useState("Post-Launch");
  const [addItem, setAddItem] = useState("");
  const [adding, setAdding] = useState(false);

  const phases = [...new Set(items.map((k) => k.phase))];
  const done = items.filter((k) => k.done).length;
  const pct = Math.round((done / Math.max(items.length, 1)) * 100);

  const suggestGoals = async () => {
    setBusy(true);
    setBusyMsg("SUGGESTING GOALS…");
    try {
      const sys = "Return ONLY a valid JSON array of strings. No fences, no explanation.";
      const raw = await callAI(
        [{ role: "user", content: "Suggest 4 specific post-launch checklist items for an AI-powered evolution platform like WhisperX NEXUS PRIME." }],
        sys
      );
      const goals = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim());
      setSuggestions(goals);
      toast("AI goals ready");
    } catch (e) {
      setSuggestions([
        "Monitor AI API error rate for first 48 hours",
        "Document all evolution results in the Archive",
        "Validate tier-3 admin access with real users",
        "Export first production evolution report",
      ]);
      toast("Using fallback suggestions");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  const adoptSuggestion = (s) => {
    dispatch({
      type: "KICKOFF_ADD",
      item: { id: `k${Date.now()}`, phase: "Post-Launch", item: s, done: false, ai: true },
    });
    setSuggestions((prev) => prev.filter((x) => x !== s));
    toast("Goal added");
  };

  const doAdd = () => {
    if (!addItem.trim()) return;
    dispatch({
      type: "KICKOFF_ADD",
      item: { id: `k${Date.now()}`, phase: addPhase, item: addItem.trim(), done: false, ai: false },
    });
    setAddItem("");
    setAdding(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text, marginBottom: 4 }}>
            Kickoff Planner
          </h1>
          <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fMono }}>
            {done}/{items.length} complete
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GBtn sm onClick={() => setAdding((a) => !a)}>
            <Plus size={11} />{adding ? "Cancel" : "Add Item"}
          </GBtn>
          <GBtn sm accent onClick={suggestGoals}>
            <Star size={11} />AI Suggest
          </GBtn>
        </div>
      </div>

      {/* Progress bar */}
      <GCard style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono }}>OVERALL PROGRESS</span>
          <span style={{ fontSize: 9, fontFamily: G.fMono, color: pct === 100 ? G.emerald : G.violet }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 6, background: G.glass, borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: pct === 100
                ? `linear-gradient(90deg,${G.emerald},${G.cyan})`
                : `linear-gradient(90deg,${G.violet},${G.rose})`,
              borderRadius: 99,
            }}
          />
        </div>
      </GCard>

      {/* AI suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <GCard hue="violet" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Sparkles size={12} color={G.lav} />
                <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.lav }}>
                  AI SUGGESTED GOALS
                </p>
                <Chip color={G.violet}>NEW</Chip>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: G.glass, borderRadius: 9 }}>
                    <Sparkles size={10} color={G.violet} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 11, color: G.text, fontFamily: G.fBody }}>{s}</span>
                    <GBtn sm onClick={() => adoptSuggestion(s)} accent>
                      <Plus size={9} />Add
                    </GBtn>
                  </div>
                ))}
              </div>
            </GCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <GCard style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 5 }}>ITEM</p>
                  <input
                    autoFocus
                    value={addItem}
                    onChange={(e) => setAddItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doAdd()}
                    placeholder="Checklist item description…"
                    style={{
                      width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid ${G.border}`,
                      borderRadius: 8, padding: "8px 12px", color: G.text,
                      fontSize: 11, fontFamily: G.fBody, outline: "none",
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 5 }}>PHASE</p>
                  <select
                    value={addPhase}
                    onChange={(e) => setAddPhase(e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.4)", border: `1px solid ${G.border}`,
                      borderRadius: 8, padding: "8px 10px", color: G.text,
                      fontSize: 11, fontFamily: G.fBody, outline: "none",
                    }}
                  >
                    {phases.map((p) => <option key={p} value={p}>{p}</option>)}
                    <option value="Post-Launch">Post-Launch</option>
                  </select>
                </div>
                <GBtn accent onClick={doAdd}><Plus size={11} />Add</GBtn>
              </div>
            </GCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase groups */}
      {phases.map((phase) => {
        const phaseItems = items.filter((k) => k.phase === phase);
        const phaseDone = phaseItems.filter((k) => k.done).length;
        return (
          <div key={phase}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ height: 1, flex: 1, background: G.border }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: G.muted, fontFamily: G.fSyne, letterSpacing: "0.12em" }}>
                {phase.toUpperCase()}
              </span>
              <Chip color={phaseDone === phaseItems.length ? G.emerald : G.violet}>
                {phaseDone}/{phaseItems.length}
              </Chip>
              <div style={{ height: 1, flex: 1, background: G.border }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {phaseItems.map((k) => (
                <motion.div
                  key={k.id}
                  layout
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: k.done ? `${G.emerald}10` : G.glass,
                    border: `1px solid ${k.done ? G.emerald + "30" : G.border}`,
                    borderRadius: 11,
                    cursor: "pointer",
                    opacity: k.done ? 0.7 : 1,
                  }}
                  onClick={() => dispatch({ type: "KICKOFF_TOGGLE", id: k.id })}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 7,
                    border: `1.5px solid ${k.done ? G.emerald : G.border}`,
                    background: k.done ? G.emerald : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s",
                  }}>
                    {k.done && <CheckCheck size={11} color="#000" />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 11, fontFamily: G.fBody, color: G.text,
                    textDecoration: k.done ? "line-through" : "none",
                  }}>
                    {k.item}
                  </span>
                  {k.ai && <Chip color={G.violet}>AI</Chip>}
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: "KICKOFF_DELETE", id: k.id }); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: G.dim, padding: 2 }}
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 5 — ANALYTICS VIEW
// Real-time KPI tiles, activity sparklines, vault/evolution charts.
// ═════════════════════════════════════════════════════════════════════════════

export function AnalyticsView({ state, dispatch }) {
  const filter = state.analyticsFilter || "7d";
  const FILTERS = ["24h", "7d", "30d", "all"];

  // Derived stats
  const vaultFiles = state.vault?.length || 0;
  const parsedFiles = state.vault?.filter((f) => f.status === "done").length || 0;
  const evolutions = state.evoHistory?.length || 0;
  const contacts = state.contacts?.length || 0;
  const budgetNet =
    (state.budget?.filter((b) => b.type === "income").reduce((s, b) => s + b.amount, 0) || 0) -
    (state.budget?.filter((b) => b.type === "expense").reduce((s, b) => s + b.amount, 0) || 0);

  // Fake activity sparklines (in production, derive from timestamps)
  const SPARK_DATA = {
    vault: [1, 2, 1, 4, 2, 3, vaultFiles],
    evo: [0, 1, 0, 2, 1, 2, evolutions],
    contacts: [1, 1, 2, 2, 2, 3, contacts],
    budget: [200, 400, 350, 800, 1200, 1500, Math.max(budgetNet, 0)],
  };

  // Mini bar chart component
  const MiniBar = ({ data, color }) => {
    const max = Math.max(...data, 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
        {data.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              minHeight: 2,
              background:
                i === data.length - 1
                  ? color
                  : `${color}40`,
              borderRadius: 2,
              transition: "height 0.4s ease",
            }}
          />
        ))}
      </div>
    );
  };

  const TILES = [
    { l: "Vault Files", v: vaultFiles, sub: `${parsedFiles} analyzed`, c: G.cyan, data: SPARK_DATA.vault, icon: Database },
    { l: "Evolutions", v: evolutions, sub: "total runs", c: G.rose, data: SPARK_DATA.evo, icon: Zap },
    { l: "Contacts", v: contacts, sub: "in CRM", c: G.amber, data: SPARK_DATA.contacts, icon: Users },
    { l: "Net Revenue", v: `$${Math.abs(budgetNet).toLocaleString()}`, sub: budgetNet >= 0 ? "profit" : "loss", c: budgetNet >= 0 ? G.emerald : G.red, data: SPARK_DATA.budget, icon: TrendingUp },
  ];

  // Readiness ring
  const readinessItems = state.readinessItems || [];
  const readinessDone = readinessItems.filter((r) => r.done).length;
  const readinessPct = readinessItems.length
    ? Math.round((readinessDone / readinessItems.length) * 100)
    : 0;
  const RING_R = 38;
  const RING_CIRC = 2 * Math.PI * RING_R;

  // Auth tier dist mock
  const tierDistData = [
    { label: "Guest", count: 12, c: G.emerald },
    { label: "File", count: 5, c: G.cyan },
    { label: "Login", count: 8, c: G.violet },
    { label: "Admin", count: 2, c: G.rose },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header + filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text }}>
          Analytics
        </h1>
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => dispatch({ type: "ANALYTICS_FILTER", filter: f })}
              style={{
                padding: "5px 12px", borderRadius: 8,
                background: filter === f ? `linear-gradient(135deg,${G.violet},${G.rose})` : G.glass,
                border: `1px solid ${filter === f ? G.borderRose : G.border}`,
                color: G.text, fontSize: 10, fontFamily: G.fMono,
                fontWeight: 700, cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {TILES.map(({ l, v, sub, c, data, icon: Icon }) => (
          <GCard key={l} style={{ padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: `${c}18`, border: `1px solid ${c}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={13} color={c} />
              </div>
              <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fBody, fontWeight: 700, flex: 1 }}>{l}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, fontFamily: G.fSyne, color: G.text, lineHeight: 1, marginBottom: 4 }}>
              {v}
            </p>
            <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 8 }}>{sub}</p>
            <MiniBar data={data} color={c} />
          </GCard>
        ))}
      </div>

      {/* Two-column analytics row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Readiness ring */}
        <GCard style={{ padding: "20px", display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={RING_R} fill="none" stroke={G.glass} strokeWidth="7" />
              <circle
                cx="45" cy="45" r={RING_R} fill="none"
                stroke={readinessPct >= 80 ? G.emerald : readinessPct >= 55 ? G.amber : G.rose}
                strokeWidth="7"
                strokeDasharray={`${(readinessPct / 100) * RING_CIRC} ${RING_CIRC}`}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <p style={{ fontSize: 18, fontWeight: 900, fontFamily: G.fSyne, color: G.text, lineHeight: 1 }}>
                {readinessPct}%
              </p>
              <p style={{ fontSize: 7, color: G.muted, fontFamily: G.fMono }}>READY</p>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: G.fSyne, fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 6 }}>
              Platform Readiness
            </p>
            <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody, lineHeight: 1.6 }}>
              {readinessDone}/{readinessItems.length} checklist items complete
            </p>
          </div>
        </GCard>

        {/* Auth tier distribution */}
        <GCard style={{ padding: "20px" }}>
          <p style={{ fontFamily: G.fSyne, fontSize: 11, fontWeight: 800, color: G.pink, marginBottom: 14 }}>
            Auth Tier Distribution
          </p>
          {tierDistData.map(({ label, count, c }) => {
            const total = tierDistData.reduce((s, d) => s + d.count, 0);
            const pct = Math.round((count / total) * 100);
            return (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody }}>{label}</span>
                  <span style={{ fontSize: 10, fontFamily: G.fMono, color: c }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: G.glass, borderRadius: 99 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{ height: "100%", background: c, borderRadius: 99 }}
                  />
                </div>
              </div>
            );
          })}
        </GCard>
      </div>

      {/* Activity feed */}
      <GCard style={{ padding: "16px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 11, fontWeight: 800, color: G.pink, marginBottom: 12 }}>
          Recent Activity
        </p>
        {state.evoHistory && state.evoHistory.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.evoHistory.slice(0, 5).map((ev) => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", background: G.glass, borderRadius: 9,
              }}>
                <StatusDot color={G.rose} />
                <span style={{ flex: 1, fontSize: 11, fontFamily: G.fBody, color: G.text }}>
                  Evolution: <strong>{ev.newSystemName || "Unnamed"}</strong>
                </span>
                <span style={{ fontSize: 9, fontFamily: G.fMono, color: G.muted }}>
                  {new Date(ev.ts).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: G.muted, fontFamily: G.fBody, textAlign: "center", padding: "20px 0" }}>
            No activity yet. Run an evolution in the Forge.
          </p>
        )}
      </GCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 6 — EXPORT VIEW
// Multi-format export hub: JSON, Markdown, copy-to-clipboard, readiness gate.
// ═════════════════════════════════════════════════════════════════════════════

export function ExportView({ state, toast }) {
  const [exporting, setExporting] = useState(null);

  const readinessDone = (state.readinessItems || []).filter((r) => r.done).length;
  const readinessTotal = (state.readinessItems || []).length;
  const readinessPct = readinessTotal ? Math.round((readinessDone / readinessTotal) * 100) : 0;
  const canExport = readinessPct >= 50;

  const buildExportPayload = () => ({
    meta: {
      version: "27.0-NEXUS-PRIME",
      exportedAt: new Date().toISOString(),
      authTier: state.authTier,
      user: state.authUser,
    },
    vault: state.vault || [],
    evoHistory: state.evoHistory || [],
    contacts: state.contacts || [],
    budget: state.budget || [],
    readiness: state.readinessItems || [],
    docs: state.docs || [],
    canvasNodes: state.canvasNodes || [],
    canvasEdges: state.canvasEdges || [],
  });

  const exportJSON = async () => {
    if (!canExport) { toast("Readiness too low — fix gaps first", "error"); return; }
    setExporting("json");
    await new Promise((r) => setTimeout(r, 600));
    const blob = new Blob([JSON.stringify(buildExportPayload(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-prime-v27-export-${Date.now()}.json`;
    a.click();
    setExporting(null);
    toast("JSON exported successfully");
  };

  const exportMarkdown = async () => {
    if (!canExport) { toast("Readiness too low — fix gaps first", "error"); return; }
    setExporting("md");
    await new Promise((r) => setTimeout(r, 400));
    const payload = buildExportPayload();
    const lines = [
      `# WhisperX NEXUS PRIME v27 Export`,
      `> Exported: ${payload.meta.exportedAt}`,
      "",
      "## Vault",
      ...(payload.vault.map((f) => `- **${f.name}** (${f.ext}) — ${f.status}`)),
      "",
      "## Evolution History",
      ...(payload.evoHistory.map((e) => `- **${e.newSystemName || e.id}** — ${e.bName} → ${e.mName}`)),
      "",
      "## Contacts",
      ...(payload.contacts.map((c) => `- ${c.name} (${c.role}) — ${c.email}`)),
      "",
      "## Budget",
      ...(payload.budget.map((b) => `- ${b.label}: ${b.type === "income" ? "+" : "-"}$${b.amount} [${b.tag}]`)),
      "",
      "## Readiness",
      ...(payload.readiness.map((r) => `- [${r.done ? "x" : " "}] ${r.label}${r.note ? ` — ${r.note}` : ""}`)),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-prime-v27-report-${Date.now()}.md`;
    a.click();
    setExporting(null);
    toast("Markdown report exported");
  };

  const copyToClipboard = async (type) => {
    const payload = buildExportPayload();
    const text = type === "json"
      ? JSON.stringify(payload, null, 2)
      : `NEXUS PRIME v27 | Evolutions: ${payload.evoHistory.length} | Vault: ${payload.vault.length} files | Readiness: ${readinessPct}%`;
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  };

  const FORMATS = [
    {
      id: "json", label: "JSON Export", desc: "Full state snapshot — vault, evolutions, canvas, contacts, budget",
      icon: Braces, color: G.cyan, action: exportJSON,
    },
    {
      id: "md", label: "Markdown Report", desc: "Human-readable summary of all modules and data",
      icon: FileText, color: G.violet, action: exportMarkdown,
    },
    {
      id: "clip-json", label: "Copy JSON", desc: "Full JSON payload to clipboard",
      icon: Copy, color: G.amber, action: () => copyToClipboard("json"),
    },
    {
      id: "clip-sum", label: "Copy Summary", desc: "One-line platform status summary",
      icon: Hash, color: G.pink, action: () => copyToClipboard("summary"),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text }}>
        Export Hub
      </h1>

      {/* Readiness gate */}
      <GCard
        hue={readinessPct >= 80 ? "" : "rose"}
        style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: readinessPct >= 50 ? `${G.emerald}18` : `${G.rose}18`,
          border: `1px solid ${readinessPct >= 50 ? G.emerald + "40" : G.borderRose}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {readinessPct >= 50
            ? <CheckCircle2 size={18} color={G.emerald} />
            : <AlertTriangle size={18} color={G.rose} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, fontFamily: G.fBody, color: G.text, marginBottom: 2 }}>
            {readinessPct >= 80 ? "Export Ready" : readinessPct >= 50 ? "Partial Export Available" : "Readiness Below Threshold"}
          </p>
          <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fMono }}>
            {readinessDone}/{readinessTotal} readiness items complete ({readinessPct}%)
          </p>
        </div>
        <div style={{ height: 6, width: 120, background: G.glass, borderRadius: 99 }}>
          <motion.div
            animate={{ width: `${readinessPct}%` }}
            style={{
              height: "100%",
              background: readinessPct >= 50 ? G.emerald : G.rose,
              borderRadius: 99,
            }}
          />
        </div>
      </GCard>

      {/* Payload preview */}
      <GCard style={{ padding: "14px 16px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.pink, marginBottom: 10 }}>
          EXPORT PAYLOAD PREVIEW
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {[
            { l: "Vault", v: state.vault?.length || 0, c: G.cyan },
            { l: "Evolutions", v: state.evoHistory?.length || 0, c: G.rose },
            { l: "Contacts", v: state.contacts?.length || 0, c: G.amber },
            { l: "Budget", v: state.budget?.length || 0, c: G.emerald },
            { l: "Canvas Nodes", v: state.canvasNodes?.length || 0, c: G.violet },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: "center", padding: "8px", background: G.glass, borderRadius: 9 }}>
              <p style={{ fontSize: 18, fontWeight: 900, fontFamily: G.fSyne, color: c, lineHeight: 1, marginBottom: 4 }}>
                {v}
              </p>
              <p style={{ fontSize: 8, color: G.muted, fontFamily: G.fMono }}>{l}</p>
            </div>
          ))}
        </div>
      </GCard>

      {/* Export format cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {FORMATS.map(({ id, label, desc, icon: Icon, color, action }) => (
          <GCard key={id} style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} color={color} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, fontFamily: G.fBody, color: G.text }}>{label}</p>
              </div>
            </div>
            <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody, lineHeight: 1.5, marginBottom: 14 }}>
              {desc}
            </p>
            <GBtn
              onClick={action}
              disabled={!canExport || exporting === id}
              style={{ width: "100%", justifyContent: "center" }}
              accent={id === "json"}
            >
              {exporting === id ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <RefreshCw size={11} />
                  </motion.div>
                  Exporting…
                </>
              ) : (
                <>
                  <Download size={11} />{label}
                </>
              )}
            </GBtn>
          </GCard>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 7 — READER VIEW
// Block-level document deep-reader with structure tree and trace mode.
// ═════════════════════════════════════════════════════════════════════════════

export function ReaderView({ state, dispatch }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tab, setTab] = useState("structure");
  const [q, setQ] = useState("");

  const parsedFiles = (state.vault || []).filter((f) => f.status === "done");
  const file = parsedFiles.find((f) => f.id === selectedFile) || parsedFiles[0];

  // Simulated document structure derived from analysis
  const structure = useMemo(() => {
    if (!file?.analysis) return [];
    const abilities = file.analysis.abilities || [];
    return [
      { lv: 1, t: `${file.name} — Overview`, blocks: Math.max(abilities.length * 2, 4), conf: file.analysis.confidence || 94 },
      ...abilities.map((ab, i) => {
        const [label] = ab.split(":");
        return { lv: 2, t: label || `Section ${i + 1}`, blocks: 3 + i, conf: 90 + Math.floor(Math.random() * 9) };
      }),
      { lv: 1, t: "Summary & Metadata", blocks: 2, conf: 99 },
    ];
  }, [file]);

  // Trace entries
  const traces = useMemo(() => {
    if (!file?.analysis) return [];
    return (file.analysis.abilities || []).slice(0, 6).map((ab, i) => ({
      block: i + 1, page: i + 1, conf: 90 + i,
      text: ab.includes(":") ? ab.split(":")[1]?.trim() || ab : ab,
    }));
  }, [file]);

  const filteredStructure = structure.filter((s) =>
    !q || s.t.toLowerCase().includes(q.toLowerCase())
  );
  const filteredTraces = traces.filter((t) =>
    !q || t.text.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ display: "flex", gap: 18, height: "100%" }}>
      {/* File selector */}
      <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 9, fontWeight: 900, color: G.muted, fontFamily: G.fSyne, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
          VAULT FILES
        </p>
        {parsedFiles.length === 0 ? (
          <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody }}>
            Import and analyze files in the Vault first.
          </p>
        ) : (
          parsedFiles.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFile(f.id)}
              style={{
                width: "100%", textAlign: "left", padding: "9px 10px",
                borderRadius: 9, border: `1px solid ${selectedFile === f.id || (!selectedFile && parsedFiles[0]?.id === f.id) ? G.violet + "50" : G.border}`,
                background: selectedFile === f.id || (!selectedFile && parsedFiles[0]?.id === f.id)
                  ? G.violetDim : G.glass,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <FileCode size={10} color={f.color || G.cyan} />
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: G.fBody, color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.name}
                </span>
              </div>
              <p style={{ fontSize: 8, fontFamily: G.fMono, color: G.muted }}>
                {(f.analysis?.abilities || []).length} blocks
              </p>
            </button>
          ))
        )}
      </div>

      {/* Main reader */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>
        {file ? (
          <>
            {/* File header */}
            <GCard style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: G.fSyne, fontSize: 16, fontWeight: 800, color: G.text, marginBottom: 6 }}>
                    {file.name}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Chip color={file.color || G.cyan}>{file.ext}</Chip>
                    <Chip color={G.emerald}>
                      {Math.round(file.size / 1024)} KB
                    </Chip>
                    {file.analysis?.coreFunction && (
                      <Chip color={G.violet}>{file.analysis.coreFunction.slice(0, 30)}</Chip>
                    )}
                  </div>
                </div>
              </div>
              {file.analysis?.synopsis && (
                <p style={{ fontSize: 11, color: G.muted, fontFamily: G.fBody, lineHeight: 1.6, marginTop: 10, fontStyle: "italic" }}>
                  {file.analysis.synopsis}
                </p>
              )}
            </GCard>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={11} color={G.muted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sections…"
                style={{
                  width: "100%", background: G.glass, border: `1px solid ${G.border}`,
                  borderRadius: 10, padding: "8px 12px 8px 30px",
                  color: G.text, fontSize: 11, fontFamily: G.fBody, outline: "none",
                }}
              />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              {["structure", "trace", "abilities"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 9,
                    background: tab === t ? `linear-gradient(135deg,${G.violet},${G.rose})` : G.glass,
                    border: `1px solid ${tab === t ? G.borderRose : G.border}`,
                    color: G.text, fontSize: 9, fontFamily: G.fMono, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Structure tab */}
            {tab === "structure" && (
              <GCard style={{ padding: "14px" }}>
                {filteredStructure.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 9,
                      background: G.glass, marginBottom: 5,
                      marginLeft: s.lv === 2 ? 20 : 0,
                      border: `1px solid ${G.border}`,
                    }}
                  >
                    <div style={{
                      width: 3, height: 16,
                      background: s.lv === 1
                        ? `linear-gradient(${G.violet},${G.rose})`
                        : `${G.lav}50`,
                      borderRadius: 1, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: s.lv === 1 ? 11 : 10, fontWeight: s.lv === 1 ? 700 : 500, fontFamily: G.fBody, color: G.text }}>
                        {s.t}
                      </p>
                      <p style={{ fontSize: 8, color: G.muted, fontFamily: G.fMono }}>
                        {s.blocks} blocks
                      </p>
                    </div>
                    <Chip color={s.conf >= 95 ? G.emerald : G.amber}>{s.conf}%</Chip>
                  </div>
                ))}
                {filteredStructure.length === 0 && (
                  <p style={{ fontSize: 11, color: G.muted, textAlign: "center", padding: "20px 0", fontFamily: G.fBody }}>
                    No sections match your search.
                  </p>
                )}
              </GCard>
            )}

            {/* Trace tab */}
            {tab === "trace" && (
              <GCard style={{ padding: "14px" }}>
                {filteredTraces.map((t, i) => (
                  <div key={i} style={{
                    padding: "11px 13px", background: G.glass,
                    borderRadius: 10, marginBottom: 8,
                    border: `1px solid ${G.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Link2 size={10} color={G.rose} />
                      <span style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono }}>
                        Block #{t.block} · Page {t.page}
                      </span>
                      <Chip color={t.conf >= 95 ? G.emerald : G.amber}>{t.conf}%</Chip>
                    </div>
                    <p style={{ fontSize: 11, color: G.text, fontFamily: G.fBody, lineHeight: 1.6 }}>
                      {t.text}
                    </p>
                  </div>
                ))}
                {filteredTraces.length === 0 && (
                  <p style={{ fontSize: 11, color: G.muted, textAlign: "center", padding: "20px 0", fontFamily: G.fBody }}>
                    No trace results.
                  </p>
                )}
              </GCard>
            )}

            {/* Abilities tab */}
            {tab === "abilities" && (
              <GCard style={{ padding: "14px" }}>
                {(file.analysis?.abilities || []).length === 0 ? (
                  <p style={{ fontSize: 11, color: G.muted, textAlign: "center", padding: "20px 0", fontFamily: G.fBody }}>
                    No abilities extracted. Re-analyze this file in the Vault.
                  </p>
                ) : (
                  (file.analysis.abilities).map((ab, idx) => {
                    const [label, desc] = ab.split(":");
                    return (
                      <div key={idx} style={{
                        display: "flex", gap: 10, padding: "10px 12px",
                        background: G.glass, borderRadius: 10, marginBottom: 7,
                        border: `1px solid ${G.border}`,
                      }}>
                        <Zap size={12} color={G.violet} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 800, color: G.lav, fontFamily: G.fBody, marginBottom: 3 }}>
                            {label?.trim() || `Ability ${idx + 1}`}
                          </p>
                          {desc && (
                            <p style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody, lineHeight: 1.5 }}>
                              {desc.trim()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </GCard>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", opacity: 0.2 }}>
              <BookOpen size={40} color={G.muted} style={{ margin: "0 auto 12px", display: "block" }} />
              <p style={{ fontFamily: G.fBody, color: G.muted, fontSize: 12 }}>
                Import and analyze files in the Vault to use the Reader.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 8 — SETTINGS VIEW
// Config panel with API health check, tier overrides, model selection,
// and animation/debug toggles.
// ═════════════════════════════════════════════════════════════════════════════

export function SettingsView({ state, dispatch, toast }) {
  const config = state.settingsConfig || EXTENDED_INIT_STATE.settingsConfig;
  const [apiStatus, setApiStatus] = useState("idle"); // idle | checking | ok | error
  const [pingMs, setPingMs] = useState(null);

  const updateConfig = (patch) => dispatch({ type: "SETTINGS_UPDATE", patch });

  const checkApiHealth = async () => {
    setApiStatus("checking");
    const start = Date.now();
    try {
      await callAI([{ role: "user", content: "Reply with PONG only." }], "Reply with PONG.");
      setPingMs(Date.now() - start);
      setApiStatus("ok");
      toast("API healthy — " + (Date.now() - start) + "ms");
    } catch (e) {
      setApiStatus("error");
      toast("API error: " + e.message, "error");
    }
  };

  const MODELS = [
    "claude-sonnet-4-20250514",
    "claude-opus-4-6",
    "claude-haiku-4-5-20251001",
  ];

  const THEMES = [
    { id: "nexus-prime", label: "NEXUS PRIME", desc: "Deep violet × rose (default)" },
    { id: "omega", label: "OMEGA", desc: "Dark teal × amber" },
    { id: "bloom", label: "BLOOM", desc: "Pink glass × lavender" },
  ];

  const statusColor = {
    idle: G.muted,
    checking: G.amber,
    ok: G.emerald,
    error: G.red,
  }[apiStatus];

  const statusLabel = {
    idle: "Not checked",
    checking: "Pinging…",
    ok: `OK${pingMs ? " · " + pingMs + "ms" : ""}`,
    error: "Connection failed",
  }[apiStatus];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: G.fSyne, fontSize: 22, fontWeight: 800, color: G.text }}>
        Settings
      </h1>

      {/* API Configuration */}
      <GCard style={{ padding: "18px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.pink, marginBottom: 14, letterSpacing: "0.1em" }}>
          AI CONFIGURATION
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Model selector */}
          <div>
            <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono, marginBottom: 6 }}>
              ACTIVE MODEL
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => updateConfig({ apiModel: m })}
                  style={{
                    flex: 1, padding: "8px 6px", borderRadius: 9,
                    background: config.apiModel === m
                      ? `linear-gradient(135deg,${G.violet},${G.rose})`
                      : G.glass,
                    border: `1px solid ${config.apiModel === m ? G.borderRose : G.border}`,
                    color: G.text, fontSize: 8, fontFamily: G.fMono,
                    fontWeight: 700, cursor: "pointer", textAlign: "center",
                  }}
                >
                  {m.replace("claude-", "").replace("-20250514", "").replace("-20251001", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Max tokens slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fMono }}>MAX TOKENS</p>
              <span style={{ fontSize: 9, fontFamily: G.fMono, color: G.violet }}>{config.maxTokens}</span>
            </div>
            <input
              type="range" min="200" max="4000" step="100"
              value={config.maxTokens}
              onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: G.violet }}
            />
          </div>

          {/* API health */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", background: G.glass, borderRadius: 10,
            border: `1px solid ${G.border}`,
          }}>
            <StatusDot color={statusColor} pulse={apiStatus === "checking"} />
            <span style={{ flex: 1, fontSize: 10, fontFamily: G.fMono, color: statusColor }}>
              {statusLabel}
            </span>
            <GBtn sm onClick={checkApiHealth} disabled={apiStatus === "checking"}>
              {apiStatus === "checking" ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                  <RefreshCw size={10} />
                </motion.div>
              ) : (
                <Activity size={10} />
              )}
              Check Health
            </GBtn>
          </div>
        </div>
      </GCard>

      {/* Theme */}
      <GCard style={{ padding: "18px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.pink, marginBottom: 14, letterSpacing: "0.1em" }}>
          DESIGN THEME
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {THEMES.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => { updateConfig({ theme: id }); toast(`Theme: ${label}`); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: config.theme === id ? G.violetDim : G.glass,
                border: `1px solid ${config.theme === id ? G.borderViolet : G.border}`,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 7,
                border: `2px solid ${config.theme === id ? G.violet : G.border}`,
                background: config.theme === id ? G.violet : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {config.theme === id && <CheckCheck size={11} color="#fff" />}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, fontFamily: G.fSyne, color: G.text }}>{label}</p>
                <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fBody }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </GCard>

      {/* Toggle switches */}
      <GCard style={{ padding: "18px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.pink, marginBottom: 14, letterSpacing: "0.1em" }}>
          PLATFORM OPTIONS
        </p>
        {[
          { key: "enableAnimations", label: "Motion & Animations", desc: "Enable framer-motion transitions throughout the UI" },
          { key: "debugMode", label: "Debug Mode", desc: "Show internal state IDs, reducer action logs in terminal" },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: `1px solid ${G.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: G.fBody, color: G.text, marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 9, color: G.muted, fontFamily: G.fBody }}>{desc}</p>
            </div>
            <button
              onClick={() => updateConfig({ [key]: !config[key] })}
              style={{
                width: 38, height: 20, borderRadius: 99,
                background: config[key] ? G.violet : G.glass,
                border: `1px solid ${config[key] ? G.borderViolet : G.border}`,
                cursor: "pointer", position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ x: config[key] ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  position: "absolute", top: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: config[key] ? "#fff" : G.muted,
                }}
              />
            </button>
          </div>
        ))}
      </GCard>

      {/* Platform info */}
      <GCard style={{ padding: "16px" }}>
        <p style={{ fontFamily: G.fSyne, fontSize: 10, fontWeight: 800, color: G.pink, marginBottom: 12, letterSpacing: "0.1em" }}>
          PLATFORM INFO
        </p>
        {[
          ["Version", "27.0-NEXUS-PRIME"],
          ["AI Model", config.apiModel],
          ["Max Tokens", config.maxTokens],
          ["Auth Tier", ["Guest", "File", "Login", "Admin"][state.authTier] || "Guest"],
          ["Theme", config.theme],
        ].map(([l, v]) => (
          <div key={l} style={{
            display: "flex", justifyContent: "space-between",
            padding: "7px 0", borderBottom: `1px solid ${G.border}`,
          }}>
            <span style={{ fontSize: 10, color: G.muted, fontFamily: G.fBody }}>{l}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: G.fMono, color: G.text }}>{v}</span>
          </div>
        ))}
      </GCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION GUIDE (printed as a JS comment — no runtime cost)
// ═════════════════════════════════════════════════════════════════════════════

/*
─────────────────────────────────────────────────────────────────────────────
STEP 1 — Merge EXTENDED_ACCESS into the main ACCESS object:

  import { EXTENDED_ACCESS } from "./WhisperX-NEXUS-PRIME-v27-ExtendedModules";

  const ACCESS = {
    overview:0, summary:0, vault:1, reader:1, docs:1,
    forge:2, archive:2, workspace:2, ai:2, history:2, readiness:2,
    slides:2, topology:2, terminal:2, contacts:3, budget:3, settings:3,
    ...EXTENDED_ACCESS,
  };

─────────────────────────────────────────────────────────────────────────────
STEP 2 — Merge EXTENDED_INIT_STATE into initState:

  const initState = {
    ...existingInitState,
    ...EXTENDED_INIT_STATE,
  };

─────────────────────────────────────────────────────────────────────────────
STEP 3 — Merge extendedReducer into your main reducer:

  function reducer(state, action) {
    const base = mainReducerSwitch(state, action);  // your existing switch
    if (base !== state) return base;
    return extendedReducer(state, action);
  }

─────────────────────────────────────────────────────────────────────────────
STEP 4 — Add views to the VIEWS map inside WhisperXNexusPrime():

  import {
    TeamView, SWOTView, MermaidView, KickoffView,
    AnalyticsView, ExportView, ReaderView, SettingsView,
  } from "./WhisperX-NEXUS-PRIME-v27-ExtendedModules";

  const VIEWS = {
    ...existingViews,
    team:      canAccess("team")     ? <TeamView state={state} dispatch={dispatch} toast={toast} /> : <AccessDenied .../>,
    swot:      canAccess("swot")     ? <SWOTView state={state} dispatch={dispatch} toast={toast} setBusy={setBusy} setBusyMsg={setBusyMsg} /> : <AccessDenied .../>,
    mermaid:   canAccess("mermaid")  ? <MermaidView state={state} dispatch={dispatch} toast={toast} setBusy={setBusy} setBusyMsg={setBusyMsg} /> : <AccessDenied .../>,
    kickoff:   canAccess("kickoff")  ? <KickoffView state={state} dispatch={dispatch} toast={toast} setBusy={setBusy} setBusyMsg={setBusyMsg} /> : <AccessDenied .../>,
    analytics: canAccess("analytics")? <AnalyticsView state={state} dispatch={dispatch} /> : <AccessDenied .../>,
    export:    canAccess("export")   ? <ExportView state={state} toast={toast} /> : <AccessDenied .../>,
    reader:    canAccess("reader")   ? <ReaderView state={state} dispatch={dispatch} /> : <AccessDenied .../>,
    settings:  canAccess("settings") ? <SettingsView state={state} dispatch={dispatch} toast={toast} /> : <AccessDenied .../>,
  };

─────────────────────────────────────────────────────────────────────────────
STEP 5 — Add TAXONOMY entries. Append to the TAXONOMY array:

  {
    feature: "Extended Suite", icon: Rocket, color: G.cyan,
    workflows: [
      { id:"wf-team",      label:"People",     icon:Users,       color:G.amber,   tier:2,
        categories:[{ label:"Team",     modules:["team","kickoff"],              sub:[] }] },
      { id:"wf-strategy",  label:"Strategy",   icon:Shield,      color:G.violet,  tier:2,
        categories:[{ label:"Analysis", modules:["swot","analytics"],            sub:[] }] },
      { id:"wf-architect", label:"Architect",  icon:GitBranch,   color:G.cyan,    tier:1,
        categories:[{ label:"Diagram",  modules:["mermaid","reader"],            sub:[] }] },
      { id:"wf-ops-ext",   label:"Operations", icon:Download,    color:G.emerald, tier:2,
        categories:[{ label:"Output",   modules:["export","settings"],           sub:[] }] },
    ],
  },

─────────────────────────────────────────────────────────────────────────────
*/

export default {
  TeamView,
  SWOTView,
  MermaidView,
  KickoffView,
  AnalyticsView,
  ExportView,
  ReaderView,
  SettingsView,
  EXTENDED_ACCESS,
  EXTENDED_INIT_STATE,
  extendedReducer,
};
