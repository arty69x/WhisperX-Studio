
import React from 'react';
import { RuntimeStatus } from '../types';

interface ControlBarProps {
  status: RuntimeStatus;
  onAction: (action: string) => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ status, onAction }) => {
  return (
    <div className="h-12 border-b-4 border-black flex items-center bg-white px-6 gap-4 shrink-0 z-[90]">
      <div className="flex items-center gap-3 mr-4">
        <div className={`w-3 h-3 rounded-full border-2 border-black ${status === 'RUNNING' ? 'bg-green-500 animate-pulse' : status === 'BOOTING' ? 'bg-yellow-400 animate-bounce' : 'bg-red-500'}`}></div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Runtime_{status}</span>
          <span className="text-[7px] font-bold text-gray-400 uppercase leading-none">สถานะระบบ</span>
        </div>
      </div>

      <div className="h-8 w-[2px] bg-black/10 mx-2"></div>

      <div className="flex gap-2">
        <button 
          onClick={() => onAction(status === 'RUNNING' ? 'STOP' : 'START')}
          className={`h-9 px-4 flex flex-col items-center justify-center border-2 border-black transition-all prism-shadow-active ${
            status === 'RUNNING' ? 'bg-red-600 text-white' : 'bg-green-500 text-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className={`fas ${status === 'RUNNING' ? 'fa-stop' : 'fa-play'} text-[10px]`}></i>
            <span className="text-[9px] font-black uppercase">{status === 'RUNNING' ? 'TERMINATE' : 'BOOT_RUN'}</span>
          </div>
          <span className="text-[7px] font-bold uppercase opacity-50 leading-none">{status === 'RUNNING' ? 'หยุดการทำงาน' : 'เริ่มรันระบบ'}</span>
        </button>

        <button 
          onClick={() => onAction('RELOAD')}
          className="h-9 px-4 flex flex-col items-center justify-center border-2 border-black bg-white text-black transition-all prism-shadow-active hover:bg-yellow-400"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-rotate text-[10px]"></i>
            <span className="text-[9px] font-black uppercase">HOT_RELOAD</span>
          </div>
          <span className="text-[7px] font-bold uppercase opacity-50 leading-none">รีโหลดด่วน</span>
        </button>
      </div>

      <div className="h-8 w-[2px] bg-black/10 mx-2"></div>

      <div className="flex gap-2 flex-1">
        <button 
          onClick={() => onAction('SAVE')}
          className="h-9 px-4 flex flex-col items-center justify-center border-2 border-black bg-black text-white transition-all prism-shadow-active"
        >
          <span className="text-[9px] font-black uppercase">SAVE_MANIFEST</span>
          <span className="text-[7px] font-bold uppercase opacity-50 leading-none">บันทึกโครงการ</span>
        </button>
        <button 
          onClick={() => onAction('SHARE')}
          className="h-9 px-4 flex flex-col items-center justify-center border-2 border-black bg-white text-black transition-all prism-shadow-active hover:bg-indigo-400"
        >
          <span className="text-[9px] font-black uppercase">SHARE_UPLINK</span>
          <span className="text-[7px] font-bold uppercase opacity-50 leading-none">แชร์โปรเจกต์</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onAction('IMPORT')}
          className="h-9 px-4 flex items-center justify-center border-2 border-black bg-gray-100 text-black text-[9px] font-black uppercase prism-shadow-active hover:bg-gray-200"
        >
          IMPORT / นำเข้า
        </button>
        <button 
          onClick={() => onAction('EXPORT')}
          className="h-9 px-4 flex items-center justify-center border-2 border-black bg-gray-100 text-black text-[9px] font-black uppercase prism-shadow-active hover:bg-gray-200"
        >
          EXPORT / ส่งออก
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
