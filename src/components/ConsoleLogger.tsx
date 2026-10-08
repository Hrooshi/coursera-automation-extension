import React, { useRef, useEffect } from 'react';
import { AutomationLog } from '../types';
import { Terminal, Trash2, Shield, Zap, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ConsoleLoggerProps {
  logs: AutomationLog[];
  onClearLogs: () => void;
}

export const ConsoleLogger: React.FC<ConsoleLoggerProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: AutomationLog['type']) => {
    switch (type) {
      case 'video':
        return <Zap className="w-3.5 h-3.5 text-blue-400" />;
      case 'bypass':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'navigation':
        return <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono text-xs">
      <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>Real-Time Extension Execution Console</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full">
            {logs.length} events
          </span>
        </div>
        <button
          onClick={onClearLogs}
          className="text-slate-400 hover:text-red-400 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          title="Clear console"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div ref={scrollRef} className="p-3 bg-slate-950/90 max-h-48 overflow-y-auto flex flex-col gap-1.5 select-text">
        {logs.length === 0 ? (
          <div className="text-slate-400 italic py-2 text-center text-[11px]">
            No automation events fired yet. Try clicking "Complete Video Instantly" or toggle speed in the extension popup above.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed text-[11px]">
              <span className="text-slate-400 shrink-0 font-sans">{log.timestamp}</span>
              <span className="mt-0.5 shrink-0">{getLogIcon(log.type)}</span>
              <div className="flex-1">
                <span className="text-slate-200">{log.message}</span>
                {log.details && (
                  <div className="text-slate-400 text-[10px] pl-2 border-l border-slate-800 mt-0.5">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
