"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Btn from "@/components/ui/Btn";
import GInput from "@/components/ui/GInput";
import GlassCard from "@/components/ui/GlassCard";
import { Sparkles, Mail, Lock, LogIn } from "lucide-react";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/");
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in!");
      }
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-sm p-8 flex flex-col gap-6">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.div variants={item} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--violet)] flex items-center justify-center shadow-xl shadow-[var(--primary)]/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase italic">TaskOS Pro</h1>
            <p className="text-xs text-white/40 tracking-widest font-mono uppercase">Enter the Nexus</p>
          </motion.div>

          <motion.form variants={item} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
              <GInput 
                icon={Mail} 
                type="email" 
                placeholder="name@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Password</label>
              <GInput 
                icon={Lock} 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            
            <Btn type="submit" disabled={loading} className="w-full mt-2 font-bold uppercase tracking-widest">
              {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
            </Btn>
          </motion.form>

          <motion.div variants={item} className="flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-white/20"><span className="bg-[#0d001a] px-2">Or continue with</span></div>
            </div>
            <Btn variant="secondary" onClick={handleGoogle} className="w-full gap-2 hover:bg-white/10 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-4 h-4" alt="Google Logo" />
              <span>Google WorkSpace</span>
            </Btn>
          </motion.div>

          <motion.button 
            variants={item}
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-center text-xs text-white/40 hover:text-[var(--primary)] transition-all font-bold uppercase tracking-wider"
          >
            {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </motion.button>
        </motion.div>
      </GlassCard>
    </div>
  );
}
