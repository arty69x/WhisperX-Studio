"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import GInput from "@/components/ui/GInput";
import { User, Mail, Shield, Bell, Moon, Sun, Save } from "lucide-react";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setTimeout(() => {
        setDisplayName(profile.displayName || "");
        setNotifications(profile.notifications ?? true);
      }, 0);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        notifications,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Synchronizing with Nexus...</div>;
  if (!user) return <div className="p-8 text-center text-white/40">Unauthorized access. Please log in.</div>;

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--violet)] flex items-center justify-center text-3xl font-black font-display text-white shadow-xl shadow-[var(--primary)]/20">
          {displayName[0] || user.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black font-display italic uppercase tracking-tight">Agent Profile</h1>
          <p className="text-sm font-mono text-white/40 tracking-widest">{user.email}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
            <User size={18} className="text-[var(--primary)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Personal Data</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Display Identity</label>
              <GInput 
                icon={User} 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Agent Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Contact Method</label>
              <GInput icon={Mail} value={user.email || ""} disabled className="opacity-50" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
            <Bell size={18} className="text-[var(--cyan)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-white/40" />
                <span className="text-sm font-semibold">Pulse Notifications</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-white/40" />
                <span className="text-sm font-semibold">High Density Theme</span>
              </div>
              <Badge label="ACTIVE" color="var(--primary)" small />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item} className="flex justify-end">
        <Btn onClick={handleSave} disabled={saving} className="gap-2 px-8 font-bold uppercase tracking-widest">
          {saving ? "Storing..." : <><Save size={16} /> Update Record</>}
        </Btn>
      </motion.div>
    </motion.div>
  );
}

function Badge({ label, color, small }: { label: string; color: string; small?: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase text-white`} style={{ backgroundColor: color + '40', border: `1px solid ${color}80` }}>
      {label}
    </span>
  );
}
