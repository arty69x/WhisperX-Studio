"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import { Upload, ScanText, Copy, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function OCRInner() {
  const [img, setImg] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleOcr = async () => {
    if (!img) return;
    setLoading(true);
    setText("");
    try {
      const worker = await createWorker("eng+tha", 1, {
        logger: m => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        }
      });
      const { data: { text } } = await worker.recognize(img);
      setText(text);
      await worker.terminate();
      toast.success("OCR สำเร็จเรียบร้อย");
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดในการทำ OCR");
    } finally {
      setLoading(false);
      setProgress(0);
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
      className="p-6 max-w-5xl mx-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold text-[var(--text)]">Image-to-Text OCR</h2>
        <p className="text-[var(--text-soft)] text-sm">แปลงรูปภาพข้อความหรือภาพสไลด์ให้เป็นตัวอักษรที่แก้ไขได้ (รองรับภาษาไทย)</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-[var(--glass-border)] hover:border-[var(--primary)]/40 transition-all group">
          {img ? (
            <div className="w-full h-full flex flex-col items-center gap-4">
              <div className="relative group/img max-h-[400px] overflow-hidden rounded-xl border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Source" className="w-full h-full object-contain" />
                <button onClick={() => setImg(null)} className="absolute top-2 right-2 p-1.5 bg-red-400 rounded-lg text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
              {!loading && <Btn primary onClick={handleOcr}><ScanText size={16} className="mr-1" /> เริ่มประมวลผล</Btn>}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--glass)] flex items-center justify-center mx-auto text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/10 transition-all">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">ลากไฟล์รูปภาพมาที่นี่</p>
                <p className="text-xs text-[var(--text-muted)]">หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์</p>
              </div>
              <Btn onClick={() => fileRef.current?.click()}>เลือกรูปภาพ</Btn>
            </div>
          )}
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onFileChange} />
        </GlassCard>

        <GlassCard className="p-6 flex flex-col h-full min-h-[300px] bg-black/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[var(--text)]">ผลลัพธ์ข้อความ</h3>
            <div className="flex gap-2">
              <Btn small disabled={!text} onClick={() => { navigator.clipboard.writeText(text); toast.success("คัดลอกสำเร็จ"); }}><Copy size={12} className="mr-1" /> คัดลอก</Btn>
              <Btn small danger disabled={!text} onClick={() => setText("")}><Trash2 size={12} /></Btn>
            </div>
          </div>
          
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 rounded-xl backdrop-blur-sm z-10">
                <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                <div className="text-center font-bold">
                  <p className="text-sm">กำลังประมวลผล... {progress}%</p>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[var(--primary)] transition-all duration-300" style={{ width: progress + "%" }} />
                  </div>
                </div>
              </div>
            ) : null}
            
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ข้อความที่สแกนจะปรากฏที่นี่..."
              className="w-full h-full bg-white/5 rounded-xl p-4 text-sm leading-relaxed text-[var(--text)] outline-none border border-[var(--glass-border)] resize-none"
            />
          </div>
        </GlassCard>
      </motion.div>
      
      <motion.div variants={item} className="soft-card p-4 rounded-2xl border-[var(--glass-border)] flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--info)]/10 flex items-center justify-center text-[var(--info)]"><ImageIcon size={20} /></div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-[var(--text)]">Tips สำหรับการสแกน</h4>
          <p className="text-xs text-[var(--text-soft)] leading-relaxed mt-1">
            เพื่อให้ได้ผลลัพธ์ที่แม่นยำที่สุด ควรใช้รูปภาพที่มีความละเอียดสูง ข้อความคมชัด และไม่มีแสงสะท้อนรบกวน 
            ระบบสามารถสแกนได้ทั้งภาษาไทยและภาษาอังกฤษพร้อมกัน
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
