
import React, { ErrorInfo, ReactNode, Component } from 'react';
import { logger } from '../services/loggerService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary class component to catch rendering errors in the React tree.
 */
// Fix: Explicitly use Component and declare state/props to resolve member visibility issues in strict TypeScript environments.
export default class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare state and props members to ensure they are recognized by the TypeScript compiler.
  public state: State;
  public props: Props;

  // Fix: Move state initialization to the constructor and call super(props) 
  // to ensure 'props' and 'state' are correctly bound to the instance according to React.Component definition.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
    // Explicitly set props to handle environments where inheritance might not correctly bind them to the instance for type checking.
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log architectural rendering faults to the system trace
    logger.error(`Critical Workspace Error: ${error.message}`, errorInfo.componentStack || undefined);
  }

  public render(): ReactNode {
    // Access state property inherited from the Component base class.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-12 text-center font-inter">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <i className="fas fa-microchip text-4xl text-red-500 animate-pulse"></i>
          </div>
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-white">Kernel Panic</h1>
          <p className="text-gray-400 mb-10 max-w-lg text-lg leading-relaxed font-medium">
            The architectural rendering engine encountered an unrecoverable fault. System logs have been updated with the stack trace.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              Hot Reload Engine
            </button>
            <button 
              onClick={() => logger.exportLogs()}
              className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95"
            >
              Export Trace
            </button>
          </div>
          
          <div className="mt-16 text-[10px] text-gray-700 font-mono uppercase tracking-[0.4em] font-black">
            Error Code: UI_RENDER_FAILURE_RECOVERY_READY
          </div>
        </div>
      );
    }

    // Safely access props property inherited from the Component base class.
    return this.props.children;
  }
}
