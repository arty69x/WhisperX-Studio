import React, { useState, useRef, useCallback } from 'react';

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const encode = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface LiveAudioSessionProps {
  mini?: boolean;
}

const LiveAudioSession: React.FC<LiveAudioSessionProps> = ({ mini }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Dormant');

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sendingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setStatus('Engine Off');

    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (_) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    processorRef.current?.disconnect();
    inputSourceRef.current?.disconnect();
    processorRef.current = null;
    inputSourceRef.current = null;

    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    inputContextRef.current?.close();
    audioContextRef.current?.close();
    inputContextRef.current = null;
    audioContextRef.current = null;

    sessionIdRef.current = null;
    sendingRef.current = false;
  }, []);

  const sendAudioChunk = useCallback(async (base64Audio: string, outputCtx: AudioContext) => {
    if (!sessionIdRef.current || sendingRef.current) {
      return;
    }

    sendingRef.current = true;
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          action: 'live-turn',
          sessionId: sessionIdRef.current,
          audio: base64Audio,
        }),
      });

      if (!response.ok) {
        throw new Error('Live turn failed');
      }

      const payload = await response.json();
      if (!payload.audio) {
        return;
      }

      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
      const audioBuffer = await decodeAudioData(decode(payload.audio), outputCtx, 24000, 1);
      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);
      source.addEventListener('ended', () => sourcesRef.current.delete(source));
      source.start(nextStartTimeRef.current);
      sourcesRef.current.add(source);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (error) {
      console.error('Live stream fault:', error);
      stopSession();
    } finally {
      sendingRef.current = false;
    }
  }, [stopSession]);

  const startSession = async () => {
    try {
      setIsActive(true);
      setStatus('Initializing...');

      const sessionResponse = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          action: 'live-session',
          systemInstruction: 'You are WhisperX Voice assistant. Help with architecture.',
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create ephemeral session');
      }

      const { sessionId } = await sessionResponse.json();
      sessionIdRef.current = sessionId;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      inputSourceRef.current = source;
      processorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16[i] = inputData[i] * 32767;
        }
        sendAudioChunk(encode(new Uint8Array(int16.buffer)), outputCtx);
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
      setStatus('Active');
    } catch (err) {
      console.error('Kernel Activation Failure:', err);
      stopSession();
    }
  };

  if (mini) {
    return (
      <button
        onClick={isActive ? stopSession : startSession}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-red-500 animate-pulse text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
        title={isActive ? 'Deactivate Voice' : 'Activate Voice Architect'}
      >
        <i className={`fas ${isActive ? 'fa-microphone-lines' : 'fa-microphone-slash'}`}></i>
      </button>
    );
  }

  return (
    <div className="p-10 glass rounded-[3rem] border border-indigo-500/20 flex flex-col items-center w-full max-w-lg shadow-2xl relative overflow-hidden group">
      <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 transition-all duration-700 relative ${isActive ? 'bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.5)] scale-110 rotate-12' : 'bg-white/5 border border-white/10'}`}>
        <i className={`fas ${isActive ? 'fa-microphone-lines' : 'fa-microphone-slash'} text-4xl ${isActive ? 'text-white' : 'text-gray-600'}`}></i>
      </div>
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Voice Intelligence</h3>
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">{status}</p>
      </div>
      <button
        onClick={isActive ? stopSession : startSession}
        className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 ${isActive ? 'text-red-400 border border-red-500/30' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'}`}
      >
        {isActive ? 'Disconnect' : 'Initialize'}
      </button>
    </div>
  );
};

export default LiveAudioSession;
