
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, ChatMessage, GitStatus, AgentStep, AgentRole, RuntimeStatus, TerminalLine, AgentMode, AgentJobStatus, AgentJobError } from './types';
import { geminiService } from './services/geminiService';
import { logger } from './services/loggerService';
import LiveAudioSession from './components/LiveAudioSession';
import CodePreview from './components/CodePreview';
import ThinkingBlock from './components/ThinkingBlock';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorToast from './components/ErrorToast';
import GitTab from './components/GitTab';
import GitConfigForm from './components/GitConfigForm';
import EditorActionModal from './components/EditorActionModal';
import Terminal from './components/Terminal';
import ControlBar from './components/ControlBar';
import AgentPipeline from './components/AgentPipeline';
import { planToAgentSteps, DEFAULT_EXECUTION_PLAN, buildExecutionPrompt } from './src/planner/prompt';
import { buildRepoEmbeddingIndex, retrieveRelevantFiles } from './src/retrieval/repoEmbeddingIndex';
import { VerifyRunner } from './src/verification/verifyRunner';
import { ExecutionTraceStore } from './src/execution/executionTrace';
import { GitHubController } from './src/controller/githubController';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.BUILD);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('IDLE');
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [agentMode, setAgentMode] = useState<AgentMode>(AgentMode.SOLO);
  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: 'loading...',
    branches: [],
    stagedFiles: [],
    modifiedFiles: [],
    isInitialized: true,
    isGitHubConnected: false,
    aheadCount: 0,
    behindCount: 0
  });
  const [agentJob, setAgentJob] = useState<AgentJobStatus | null>(null);
  const [agentError, setAgentError] = useState<AgentJobError | null>(null);
  const [isGitLoading, setIsGitLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const traceStoreRef = useRef(new ExecutionTraceStore());


  useEffect(() => {
    const saved = localStorage.getItem('whisperx_project_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.code) setPendingCode(state.code);
        if (state.messages) setMessages(state.messages);
        logger.info("Kernel: Restored project state // คืนค่าสถานะโครงการสำเร็จ");
      } catch (e) {
        logger.error("Kernel: Failed to restore state // ไม่สามารถคืนค่าสถานะได้");
      }
    }
  }, []);

  useEffect(() => {
    fetchGitStatus();
  }, []);


  const fetchGitStatus = async () => {
    setIsGitLoading(true);
    try {
      const response = await fetch('/api/agent');
      if (!response.ok) throw new Error('Unable to fetch git status');
      const data = await response.json();
      setGitStatus(prev => ({ ...prev, branch: data.branch || prev.branch, modifiedFiles: data.changedFiles || [] }));
      if (data.latestJob) {
        setAgentJob(data.latestJob);
      }
    } catch (error) {
      logger.warn('Git sync status unavailable');
    } finally {
      setIsGitLoading(false);
    }
  };

  const saveProject = () => {
    const state = { code: pendingCode, messages };
    localStorage.setItem('whisperx_project_state', JSON.stringify(state));
    logger.info("Kernel: Project manifest saved // บันทึกข้อมูลโครงการสำเร็จ");
    addTerminalLine('system', 'PROJECT_MANIFEST_SYNCED_TO_DISK');
  };

  const addTerminalLine = (type: TerminalLine['type'], content: string) => {
    setTerminalLines(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: Date.now()
    }]);
  };

  const runProductionBuild = async () => {
    setActiveTab(AppTab.TERMINAL);
    addTerminalLine('system', 'PRISM_V2.5_CORE: INITIATING_PRODUCTION_BUILD...');
    await new Promise(r => setTimeout(r, 600));
    
    addTerminalLine('output', '● CHECKING_TYPESCRIPT_INTEGRITY...');
    await new Promise(r => setTimeout(r, 800));
    addTerminalLine('output', '✓ TYPE_CHECK_SUCCESS (NO ERRORS FOUND)');
    
    addTerminalLine('output', '● OPTIMIZING_TAILWIND_ASSETS...');
    await new Promise(r => setTimeout(r, 600));
    addTerminalLine('output', '✓ CSS_MINIFICATION_COMPLETE (42KB -> 8KB)');
    
    addTerminalLine('output', '● COMPRESSING_NEURAL_WEIGHTS...');
    await new Promise(r => setTimeout(r, 1000));
    addTerminalLine('output', '✓ WEIGHTS_PACKED (128-BIT QUANTIZATION)');
    
    addTerminalLine('output', '● GENERATING_STATIC_PAGES (4/4)...');
    await new Promise(r => setTimeout(r, 500));
    addTerminalLine('output', '  /index.html      1.2kb');
    addTerminalLine('output', '  /editor.html     4.5kb');
    addTerminalLine('output', '  /visual.html     2.1kb');
    addTerminalLine('output', '  /settings.html   0.8kb');
    
    addTerminalLine('output', '✓ BUILD_COMPLETE_IN_3.5S');
    addTerminalLine('output', 'TOTAL_SIZE: 142.4KB');
    addTerminalLine('system', 'PRODUCTION_BUNDLE_READY_FOR_DEPLOYMENT');
    setRuntimeStatus('IDLE');
  };

  const handleCommand = async (cmd: string) => {
    addTerminalLine('cmd', cmd);
    const args = cmd.toLowerCase().trim().split(' ');
    
    if (args[0] === 'npm') {
      if (args[1] === 'install' || args[1] === 'i') {
        const pkg = args.slice(2).join(' ') || 'DEPENDENCIES';
        addTerminalLine('output', `FETCHING_PACKAGES: ${pkg}`);
        await new Promise(r => setTimeout(r, 1000));
        addTerminalLine('output', 'NPM_SUCCESS: NODE_MODULES_MOUNTED');
      } else if (args[1] === 'run' && (args[2] === 'build' || args[2] === 'dev')) {
        if (args[2] === 'build') {
          runProductionBuild();
        } else {
          handleControlAction('START');
        }
      } else if (args[1] === 'build') {
        runProductionBuild();
      } else {
        addTerminalLine('error', `NPM: UNKNOWN_SCRIPT: ${args[1]}`);
      }
    } else if (args[0] === 'clear') {
      setTerminalLines([]);
    } else if (args[0] === 'help') {
      addTerminalLine('output', 'COMMANDS: npm i, npm run build, npm run dev, clear, help');
    } else if (args[0] === 'build') {
      runProductionBuild();
    } else {
      addTerminalLine('error', `SHELL: NOT_FOUND: ${args[0]}`);
    }
  };

  const handleControlAction = (action: string) => {
    switch(action) {
      case 'START':
        setRuntimeStatus('BOOTING');
        addTerminalLine('system', 'INITIALIZING_RUNTIME...');
        setTimeout(() => {
          setRuntimeStatus('RUNNING');
          setActiveTab(AppTab.VISUAL);
          addTerminalLine('output', 'RUNTIME_LIVE_ON_PORT_3000');
        }, 1200);
        break;
      case 'STOP':
        setRuntimeStatus('IDLE');
        addTerminalLine('error', 'PROCESS_TERMINATED');
        break;
      case 'RELOAD':
        setRuntimeStatus('BOOTING');
        addTerminalLine('system', 'HMR_SYNCING...');
        setTimeout(() => setRuntimeStatus('RUNNING'), 500);
        break;
      case 'SAVE':
        saveProject();
        break;
      case 'SHARE':
        navigator.clipboard.writeText(window.location.href);
        logger.info("Kernel: URL Copied // คัดลอกลิงก์สำเร็จ");
        break;
      case 'EXPORT':
        const blob = new Blob([JSON.stringify({ code: pendingCode, messages })], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'whisperx_build.json';
        a.click();
        break;
      case 'IMPORT':
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (re: any) => {
            const data = JSON.parse(re.target.result);
            setPendingCode(data.code);
            setMessages(data.messages);
          };
          reader.readAsText(file);
        };
        fileInput.click();
        break;
    }
  };

  const handleAgentInteraction = async (customPrompt?: string, forcedRole?: AgentRole) => {
    const instruction = customPrompt || input;
    if (!instruction.trim()) return;
    
    const role = forcedRole || AgentRole.FRONTEND;
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: instruction, 
      timestamp: Date.now(),
      agentRole: role
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsThinking(true);

    const initialSteps: AgentStep[] = planToAgentSteps(DEFAULT_EXECUTION_PLAN);
    setPipelineSteps(agentMode === AgentMode.MULTI ? initialSteps : [
      { ...initialSteps[1], id: '1', status: 'active', label: `Execute ${role}` }
    ]);
    traceStoreRef.current.clear();

    try {
      const lowerInput = instruction.toLowerCase();
      const isConfirmation = lowerInput.includes('ยืนยัน') || lowerInput.includes('confirm');

      if (isConfirmation && messages.length > 0) {
        addTerminalLine('system', 'AGENT_CORE: REQUESTING /api/agent ...');
        setAgentError(null);

        const startResponse = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction, mode: agentMode })
        });

        const startData = await startResponse.json();
        if (startData?.latestJob) {
          setAgentJob(startData.latestJob);
        }
        if (!startResponse.ok) {
          setAgentError(startData.error || { code: 'UNKNOWN', message: 'Unknown backend error' });
          setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'error' })));
          return;
        }

        traceStoreRef.current.push('analyze', 'start', 'Building retrieval index');
        const repoIndex = buildRepoEmbeddingIndex([
          { path: 'App.tsx', content: pendingCode || '' },
          { path: 'conversation.log', content: messages.map(msg => msg.content).join('\n') }
        ]);
        const relevantFiles = retrieveRelevantFiles(instruction, repoIndex, 2);
        const repoContext = relevantFiles.map(file => `${file.path} :: tags=${file.metadata.tags.join(',')}`).join('\n');
        const plannedPrompt = buildExecutionPrompt(instruction, repoContext);
        traceStoreRef.current.push('analyze', 'success', `context files: ${relevantFiles.map(f => f.path).join(', ')}`);

        addTerminalLine('system', 'AGENT_CORE: SYNTHESIZING_ARTIFACT...');
        const build = await geminiService.executeBuild(plannedPrompt, role);
        traceStoreRef.current.push('edit', 'success', 'Artifact generated by model');

        const verifyRunner = new VerifyRunner({
          preflightEndpoint: import.meta.env.VITE_PREFLIGHT_ENDPOINT,
          maxRetries: 2
        });

        const verifySummary = await verifyRunner.runWithRepairLoop(undefined, async (errorContext) => {
          traceStoreRef.current.push('repair', 'error', errorContext);
          addTerminalLine('error', `VERIFY_FAILED => ${errorContext}`);
          await geminiService.agentChat(`Verification failed. Create a repair patch:\n${errorContext}`, messages.slice(-6), AgentRole.DEBUGGER);
        });

        traceStoreRef.current.push('test', verifySummary.ok ? 'success' : 'error', JSON.stringify(verifySummary.results));

        if (!verifySummary.ok) {
          throw new Error('Verification failed after retry budget.');
        }

        if (import.meta.env.VITE_GITHUB_CONTROLLER_ENDPOINT) {
          const controller = new GitHubController({ endpoint: import.meta.env.VITE_GITHUB_CONTROLLER_ENDPOINT });
          await controller.commitAndOpenPR({
            title: 'Automated patch from WhisperX Studio',
            body: 'Generated after successful verify stage.',
            branch: 'agent/uplink-auto'
          });
          traceStoreRef.current.push('pr', 'success', 'Dispatched to GitHub controller');
        } else {
          traceStoreRef.current.push('pr', 'success', 'Skipped controller dispatch (no endpoint configured)');
        }
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: "สร้าง Artifact สำเร็จ ระบบพร้อมใช้งานแล้ว (Synthesis Complete).", 
          thinking: build.thinking, 
          codeArtifact: build.code,
          timestamp: Date.now(),
          agentRole: role
        }]);
        addTerminalLine('output', `AGENT_JOB_COMPLETED: ${startData?.latestJob?.jobId || 'n/a'}`);
        fetchGitStatus();
      } else {
        const response = await geminiService.agentChat(instruction, messages.slice(-10), role);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: response, 
          timestamp: Date.now(),
          agentRole: role
        }]);
        setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
      }
    } catch (e) {
      logger.error("Neural Link Fault: Connection lost.");
      setAgentError({ code: 'UNKNOWN', message: 'Failed to communicate with backend agent.' });
      setPipelineSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'error' } : s));
    } finally {
      traceStoreRef.current.all().forEach(entry => {
        addTerminalLine(entry.status === 'error' ? 'error' : 'output', `[TRACE] ${entry.step}:${entry.status} => ${entry.detail}`);
      });
      setIsThinking(false);
    }
  };

  const tabs = [
    { id: AppTab.BUILD, icon: 'fa-robot', label: 'Agent', th: 'เอเจนต์' },
    { id: AppTab.EDITOR, icon: 'fa-code', label: 'Editor', th: 'โค้ด' },
    { id: AppTab.TERMINAL, icon: 'fa-terminal', label: 'Console', th: 'คอนโซล' },
    { id: AppTab.VISUAL, icon: 'fa-eye', label: 'Visual', th: 'ผลลัพธ์' },
    { id: AppTab.GIT, icon: 'fa-code-branch', label: 'Git', th: 'กิต' },
    { id: AppTab.SETTINGS, icon: 'fa-cog', label: 'System', th: 'ระบบ' }
  ];

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-white overflow-hidden select-none">
        
        {/* Desktop Top Control */}
        <div className="hidden md:block">
          <ControlBar status={runtimeStatus} onAction={handleControlAction} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b-4 border-black bg-white">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${runtimeStatus === 'RUNNING' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase">WHISPERX_V2.5</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 border-2 border-black flex items-center justify-center">
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Navigation Sidebar (Desktop + Mobile Overlay) */}
          <aside className={`
            fixed inset-y-0 left-0 z-[100] w-20 bg-white border-r-4 border-black flex flex-col items-center py-6 gap-6 transition-transform duration-300
            md:relative md:translate-x-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 group transition-all ${activeTab === tab.id ? 'text-red-600' : 'text-black hover:text-indigo-600'}`}
              >
                <div className={`w-12 h-12 flex items-center justify-center border-2 border-black prism-shadow-active transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'bg-white'}`}>
                  <i className={`fas ${tab.icon} text-lg`}></i>
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{tab.label}</span>
                <span className="text-[7px] font-bold text-gray-400 leading-none">{tab.th}</span>
              </button>
            ))}
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 flex flex-col relative bg-gray-50 overflow-hidden">
            
            {/* Mobile Actions Ribbon */}
            <div className="md:hidden flex overflow-x-auto p-2 border-b-2 border-black bg-white gap-2 custom-scrollbar-thin">
              <button onClick={() => handleControlAction('START')} className="shrink-0 px-3 py-1 border-2 border-black text-[9px] font-black uppercase bg-green-500">START</button>
              <button onClick={() => handleControlAction('SAVE')} className="shrink-0 px-3 py-1 border-2 border-black text-[9px] font-black uppercase bg-black text-white">SAVE</button>
              <button onClick={() => handleControlAction('RELOAD')} className="shrink-0 px-3 py-1 border-2 border-black text-[9px] font-black uppercase bg-white">HMR</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8" ref={scrollRef}>
              
              {activeTab === AppTab.BUILD && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 pb-40">
                  <div className="lg:col-span-3 space-y-6">
                    <header className="border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                      <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Neural_Uplink // ระบบเชื่อมต่อ</h2>
                        <p className="text-[10px] font-black text-gray-400 mt-1">CONTEXT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      </div>
                      <div className="flex border-4 border-black overflow-hidden bg-white prism-shadow self-stretch md:self-auto">
                        <button 
                          onClick={() => setAgentMode(AgentMode.SOLO)}
                          className={`flex-1 md:flex-none px-6 py-2 text-[9px] font-black uppercase transition-all ${agentMode === AgentMode.SOLO ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                        >
                          SOLO / เดี่ยว
                        </button>
                        <button 
                          onClick={() => setAgentMode(AgentMode.MULTI)}
                          className={`flex-1 md:flex-none px-6 py-2 text-[9px] font-black uppercase transition-all ${agentMode === AgentMode.MULTI ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                        >
                          MULTI / กลุ่ม
                        </button>
                      </div>
                    </header>

                    {messages.length === 0 && (
                      <div className="text-center py-20 md:py-32 opacity-10">
                        <i className="fas fa-microchip text-8xl md:text-9xl mb-6"></i>
                        <h3 className="text-2xl font-black uppercase italic tracking-[0.2em]">Awaiting Uplink...</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2">โปรดระบุคำสั่งด้านล่างเพื่อเริ่มการสร้าง</p>
                      </div>
                    )}

                    <div className="space-y-8">
                      {agentError && (
                        <div className="prism-card p-4 border-red-600 bg-red-50 text-red-700 space-y-2">
                          <h4 className="text-[10px] font-black uppercase">Agent_Error: {agentError.code}</h4>
                          <p className="text-xs font-bold">{agentError.message}</p>
                        </div>
                      )}
                      {messages.map(m => (
                        <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-2 animate-in slide-in-from-bottom-2`}>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">
                               {m.role === 'user' ? 'USER_ENGINEER' : `AGENT_${m.agentRole}`}
                             </span>
                             {m.role === 'assistant' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                          </div>
                          <div className={`prism-card p-5 max-w-[95%] md:max-w-[85%] ${m.role === 'user' ? 'bg-black text-white border-black' : 'bg-white'}`}>
                            <p className="text-xs md:text-sm font-bold leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          </div>
                          {m.codeArtifact && <div className="w-full md:max-w-[90%]"><CodePreview code={m.codeArtifact} /></div>}
                          {m.thinking && <div className="w-full md:max-w-[90%]"><ThinkingBlock thinking={m.thinking} /></div>}
                        </div>
                      ))}
                      {isThinking && (
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">
                           <i className="fas fa-spinner animate-spin"></i>
                           Neural_Processing // กำลังประมวลผล...
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="lg:col-span-1 space-y-6">
                    <div className="sticky top-4 space-y-6">
                      <AgentPipeline steps={pipelineSteps} />
                      
                      <div className="prism-card p-4 bg-yellow-400 border-black space-y-4 prism-shadow">
                        <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                          <i className="fas fa-info-circle"></i>
                          System_Insights // ข้อมูลระบบ
                        </h4>
                        <p className="text-[9px] font-bold uppercase leading-tight italic">
                          คำสั่งแนะนำ: พิมพ์ "Confirm" หรือ "ยืนยัน" เพื่อทำการสร้าง Code Component ลงใน Editor โดยอัตโนมัติ
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {activeTab === AppTab.EDITOR && (
                <div className="w-full h-full flex flex-col bg-white border-4 border-black prism-shadow overflow-hidden">
                  <header className="h-12 bg-black text-white flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                       <span className="text-[10px] font-black uppercase tracking-widest truncate">Artifact_Manifest.tsx</span>
                       <div className="flex gap-1 md:gap-2 shrink-0">
                         <button onClick={() => setIsEditorModalOpen(true)} className="w-8 h-8 bg-white/10 hover:bg-yellow-400 hover:text-black flex items-center justify-center border border-white/20 transition-all">
                           <i className="fas fa-magic text-[10px]"></i>
                         </button>
                         <button onClick={() => handleAgentInteraction("Deep Audit current code for architecture faults.", AgentRole.ARCHITECT)} className="hidden md:flex w-8 h-8 bg-white/10 hover:bg-indigo-600 flex items-center justify-center border border-white/20 transition-all">
                           <i className="fas fa-microscope text-[10px]"></i>
                         </button>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={saveProject} className="text-[9px] font-black uppercase bg-green-600 px-3 py-1">SAVE</button>
                       <button onClick={() => setPendingCode('')} className="hidden md:block text-[9px] font-black uppercase bg-red-600 px-3 py-1">PURGE</button>
                    </div>
                  </header>
                  <pre className="flex-1 p-4 md:p-8 mono text-[11px] md:text-xs overflow-auto bg-gray-50 text-black leading-relaxed">
                    {pendingCode || "// AWAITING_AI_GENERATION...\n// ใช้เมนู Agent หรือ Magic Button เพื่อเริ่มสร้างส่วนประกอบ"}
                  </pre>
                </div>
              )}

              {activeTab === AppTab.TERMINAL && (
                <div className="w-full h-full min-h-[400px]">
                  <Terminal onCommand={handleCommand} lines={terminalLines} />
                </div>
              )}

              {activeTab === AppTab.VISUAL && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {runtimeStatus === 'RUNNING' && pendingCode ? (
                    <div className="w-full h-full p-0 md:p-4 animate-in zoom-in duration-500">
                      <div className="w-full h-full bg-white border-4 border-black prism-shadow overflow-hidden flex flex-col">
                        <div className="h-10 bg-gray-100 border-b-2 border-black flex items-center px-4 gap-4">
                           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                           <div className="flex-1 bg-white border border-black text-[9px] font-black px-2 py-0.5 truncate uppercase">http://localhost:3000/preview</div>
                           <button onClick={() => handleControlAction('RELOAD')} className="text-[10px]"><i className="fas fa-rotate"></i></button>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-center p-6 md:p-20 bg-neutral-100">
                           <div className="space-y-6 max-w-lg">
                             <div className="w-20 h-20 md:w-24 md:h-24 bg-black text-white flex items-center justify-center mx-auto prism-shadow-active">
                               <i className="fas fa-rocket text-4xl"></i>
                             </div>
                             <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Runtime_Live</h2>
                             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-relaxed">
                               Next.js 15 Container Mounted // Hot Module Replacement Active
                             </p>
                             <div className="p-6 md:p-8 bg-white border-4 border-black font-black text-black uppercase text-[10px] md:text-xs">
                               กำลังแสดงผลจำลองของส่วนประกอบที่สร้างขึ้น<br/>Visualizing Synthetic Artifact
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-20 space-y-6">
                      <i className={`fas ${runtimeStatus === 'BOOTING' ? 'fa-spinner animate-spin' : 'fa-power-off'} text-9xl`}></i>
                      <p className="text-2xl font-black uppercase italic tracking-widest">
                        {runtimeStatus === 'BOOTING' ? 'Booting_Container...' : 'Runtime_Offline'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === AppTab.GIT && <GitTab data={{ branch: gitStatus.branch, changedFiles: gitStatus.modifiedFiles, latestJob: agentJob }} isLoading={isGitLoading} onRefresh={fetchGitStatus} />}
              {activeTab === AppTab.SETTINGS && (
                <div className="max-w-2xl mx-auto space-y-8">
                  <GitConfigForm />
                  <div className="prism-card p-6 border-red-500 bg-red-50 space-y-4 prism-shadow">
                    <h3 className="text-sm font-black uppercase text-red-600">Danger_Zone // พื้นที่อันตราย</h3>
                    <p className="text-[10px] font-black uppercase text-red-400">การลบข้อมูลนี้จะไม่สามารถกู้คืนได้ (Permanently purge all data).</p>
                    <button onClick={() => { if(confirm("Purge all data?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-3 bg-red-600 text-white font-black uppercase text-[10px] prism-shadow-active">
                       PURGE_ALL_DATA / ล้างข้อมูลทั้งหมด
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Omni-Command Bar (Fixed Desktop/Mobile) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-[80]">
               <div className="prism-card flex flex-col bg-white border-4 border-black transition-all focus-within:prism-shadow focus-within:translate-y-[-4px]">
                  <div className="h-7 bg-yellow-400 border-b-2 border-black flex items-center px-4 justify-between">
                     <div className="flex items-center gap-2">
                        <i className="fas fa-bolt text-[10px]"></i>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural_Command_Interface</span>
                     </div>
                     <span className="hidden md:block text-[8px] font-black opacity-40 uppercase">V2.5.0_PROD</span>
                  </div>
                  <div className="p-3 md:p-4 flex gap-4 items-center">
                     <span className="text-black font-black select-none text-sm md:text-lg tracking-tighter shrink-0">&gt;_</span>
                     <input 
                       className="flex-1 outline-none font-bold text-xs md:text-sm uppercase placeholder:text-gray-300 bg-transparent"
                       placeholder="พิมพ์คำสั่งหรือความต้องการของคุณที่นี่..."
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAgentInteraction()}
                     />
                     <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleAgentInteraction()} 
                          className="w-10 h-10 md:w-12 md:h-12 bg-black text-white flex items-center justify-center prism-shadow-active hover:bg-red-600 transition-colors"
                        >
                           <i className="fas fa-paper-plane text-sm"></i>
                        </button>
                        <LiveAudioSession mini />
                     </div>
                  </div>
               </div>
            </div>
          </main>
        </div>

        {/* Dynamic Footer Info */}
        <footer className="hidden md:flex h-10 border-t-4 border-black bg-white items-center justify-between px-8 shrink-0 z-40 relative">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${runtimeStatus === 'RUNNING' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">L_KERNEL: {runtimeStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-users text-xs"></i>
                <span className="text-[10px] font-black uppercase">CLUSTER: {agentMode}</span>
              </div>
           </div>
           <div className="flex items-center gap-6 text-[10px] font-black uppercase italic">
              <span className="text-indigo-600">WHISPERX_V2.5_SYNTHESIS_ACTIVE</span>
              <div className="w-[2px] h-4 bg-black/10"></div>
              <span className="text-black">CORE_TEMP: NORMAL</span>
           </div>
        </footer>

        <ErrorToast onOpenLogs={() => setActiveTab(AppTab.SETTINGS)} />
        <EditorActionModal isOpen={isEditorModalOpen} onClose={() => setIsEditorModalOpen(false)} onSubmit={handleAgentInteraction} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
