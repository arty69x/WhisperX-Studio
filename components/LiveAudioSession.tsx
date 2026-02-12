
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

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
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Fix: Added source tracking and proper resource cleanup for stopping sessions.
  const stopSession = useCallback(() => {
    setIsActive(false);
    setStatus('Engine Off');
    
    // Stop all active audio playback
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    audioContextRef.current?.close();
    audioContextRef.current = null;
    
    // Explicitly close the GenAI session
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
  }, []);

  const startSession = async () => {
    try {
      setIsActive(true);
      setStatus('Initializing...');
      // Initialize Gemini SDK inside the trigger to ensure fresh context/key usage.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Active');
            sessionPromise.then(session => {
              sessionRef.current = session;
            });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              // Solely rely on sessionPromise to send data to prevent race conditions.
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { 
                    data: encode(new Uint8Array(int16.buffer)), 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Fix: Added interruption handling to clear the playback queue.
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              sourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              // Schedule playback precisely using nextStartTimeRef to ensure gapless audio.
              source.start(nextStartTimeRef.current);
              sourcesRef.current.add(source);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: (e) => {
            console.error('Live API Fault:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are WhisperX Voice assistant. Help with architecture.'
        }
      });
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
