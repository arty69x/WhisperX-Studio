"use client";

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, User, Sparkles, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { geminiStream, geminiVision } from "@/lib/gemini";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface Msg {
  role: "user" | "ai";
  content: string;
  image?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AIPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", content: "สวัสดีครับ! ผมคือ TaskOS AI Assistant ผู้ช่วยส่วนตัวของคุณ คุณต้องการให้ผมช่วยวิเคราะห์โครงการ สรุปงาน หรือออกแบบสไลด์ในส่วงไหนดีครับ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const handleSend = async () => {
    if ((!input.trim() && !img) || loading) return;
    
    const userMsg = input.trim();
    const currentImg = img;
    setMsgs(prev => [...prev, { role: "user", content: userMsg, image: currentImg || undefined }]);
    setInput("");
    setImg(null);
    setLoading(true);

    try {
      if (currentImg) {
        // Vision Task
        const base64 = currentImg.split(",")[1];
        const result = await geminiVision(userMsg || "วิเคราะห์รูปนี้ให้หน่อยครับ", base64);
        setMsgs(prev => [...prev, { role: "ai", content: result }]);
      } else {
        // Chat Stream Task
        const history = msgs.map(m => ({ role: m.role, content: m.content }));
        const streamResult = await geminiStream(userMsg, history);
        
        let fullText = "";
        setMsgs(prev => [...prev, { role: "ai", content: "" }]);
        
        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          setMsgs(prev => {
            const last = [...prev];
            last[last.length - 1] = { ...last[last.length - 1], content: fullText };
            return last;
          });
        }
      }
    } catch (e: any) {
      toast.error("AI Error: " + e.message);
      setMsgs(prev => [...prev, { role: "ai", content: "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง" }]);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      className="h-full flex flex-col p-6 max-w-4xl mx-auto overflow-hidden"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow" style={{ background: "linear-gradient(135deg,var(--primary),var(--violet))" }}>
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">AI Collaboration Agent</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Gemini 1.5 Flash Connected</span>
            </div>
          </div>
        </div>
        <Btn small onClick={() => setMsgs([msgs[0]])} className="text-red-400 hover:text-red-500 border-red-400/20">
          <Trash2 size={13} className="mr-1" /> ล้างแชท
        </Btn>
      </motion.div>

      <motion.div variants={item} className="flex-1 flex flex-col overflow-hidden mb-6">
        <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border-[var(--glass-border)]">
          <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-6 scroll-smooth dot-grid">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div className={cn("flex gap-3 max-w-[85%]", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border", 
                    m.role === "user" ? "bg-white/10 border-[var(--glass-border)]" : "bg-[var(--primary)] border-transparent text-white")}>
                    {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className="space-y-2">
                    <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", 
                      m.role === "user" ? "soft-card" : "glass border-[var(--glass-border)]")}>
                      {m.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-white/10 max-w-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.image} alt="Uploaded content" className="w-full object-cover" />
                        </div>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white anim-spin">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="glass px-4 py-3 rounded-2xl">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-[var(--glass-border)]">
            {img && (
              <div className="mb-3 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-[var(--primary)]" />
                <button onClick={() => setImg(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 rounded-full text-white flex items-center justify-center text-[10px] shadow-lg">×</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onFileChange} />
              <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-xl text-[var(--text-soft)] hover:text-[var(--primary)] hover:bg-white/10 transition-all">
                <ImageIcon size={20} />
              </button>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="พิมพ์ข้อความเพื่อให้ AI ช่วยเหลือ..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text)] py-2 max-h-32 resize-none placeholder:text-[var(--text-muted)]"
              />
              <button 
                onClick={handleSend}
                disabled={loading || (!input.trim() && !img)}
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", 
                  loading || (!input.trim() && !img) ? "text-[var(--text-muted)] opacity-50" : "bg-[var(--primary)] text-white shadow-lg active:scale-95")}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      
      <motion.p variants={item} className="text-[10px] text-center text-[var(--text-muted)] font-medium">
        TaskOS AI อาจให้คำแนะนำที่ผิดพลาดได้ โปรดตรวจสอบข้อมูลสำคัญทุกครั้งก่อนใช้งานจริง
      </motion.p>
    </motion.div>
  );
}
