
import { LogEntry } from '../types';

type LogListener = (logs: LogEntry[]) => void;

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: LogListener[] = [];
  private readonly STORAGE_KEY = 'whisperx_system_logs';
  private readonly MAX_LOGS = 100;

  constructor() {
    this.loadFromStorage();
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    // Capture runtime exceptions
    window.onerror = (message, source, lineno, colno, error) => {
      this.error(`Runtime Exception: ${message}`, error?.stack || `At ${source}:${lineno}:${colno}`);
      return false; 
    };

    // Capture unhandled promise rejections (async faults)
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      this.error(`Unhandled Async Fault: ${message}`, stack);
    };
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Kernel Trace: Failed to load logs.', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      // Graceful degradation for storage issues
    }
  }

  log(level: 'error' | 'warn' | 'info', message: string, stack?: string) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      level,
      message,
      stack,
      timestamp: Date.now()
    };
    this.logs = [entry, ...this.logs].slice(0, this.MAX_LOGS);
    this.saveToStorage();
    this.notify();
    
    // Console mirroring with semantic coloring
    const colors = { error: '#ef4444', warn: '#f59e0b', info: '#6366f1' };
    console.log(`%c[WhisperX ${level.toUpperCase()}]`, `color: ${colors[level]}; font-weight: 900;`, message, stack || '');
  }

  error(message: string, stack?: string) {
    this.log('error', message, stack);
  }

  warn(message: string) {
    this.log('warn', message);
  }

  info(message: string) {
    this.log('info', message);
  }

  clear() {
    this.logs = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.notify();
  }

  exportLogs() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whisperx_system_trace_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  subscribe(listener: LogListener) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }
}

export const logger = new LoggerService();
