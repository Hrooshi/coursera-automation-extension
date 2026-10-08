import React, { useState, useEffect, useCallback } from 'react';
import { ExtensionSettings, AutomationLog } from './types';
import { ExtensionPopupWidget } from './components/ExtensionPopupWidget';
import { LmsSimulator } from './components/LmsSimulator';
import { ExtensionFilesViewer } from './components/ExtensionFilesViewer';
import { InstallationGuide } from './components/InstallationGuide';
import { ConsoleScriptsViewer } from './components/ConsoleScriptsViewer';
import { ConsoleLogger } from './components/ConsoleLogger';
import { downloadExtensionZip } from './utils/extensionGenerator';
import { 
  Zap, Laptop, FileCode, BookOpen, Download, 
  Sparkles, CheckCircle2, Shield, Eye, Command, Terminal
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'scripts' | 'source' | 'guide'>('simulator');

  // Extension Settings State
  const [settings, setSettings] = useState<ExtensionSettings>({
    autoSkipVideo: true,
    superSpeedRate: 16,
    autoPlayOnLoad: true,
    autoMute: true,
    bypassTabLock: true,
    autoAdvanceNext: true,
    autoCompleteReading: true,
    autoSolveQuizzes: true,
    actionDelayMs: 800,
    platformTarget: 'all',
  });

  // Simulator / Video connection state
  const [videoState, setVideoState] = useState({
    count: 1,
    rate: 1,
    isCompleted: false,
    lmsName: 'MIT-WPU Moodle LMS (lms.mitwpu.edu.in)',
  });

  // Triggers from popup to simulator
  const [triggerSkipCount, setTriggerSkipCount] = useState(0);
  const [triggerSpeed, setTriggerSpeed] = useState(1);
  const [triggerNextCount, setTriggerNextCount] = useState(0);

  // Real-time Activity Logs
  const [logs, setLogs] = useState<AutomationLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Universal Course & Video Auto-Completer engine loaded (v3.7.0).',
      details: 'Targeting HTML5 videos & Video.js on <all_urls> including MIT-WPU LMS, Moodle, Coursera, Canvas.',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'bypass',
      message: 'Anti-Tab Lock module activated.',
      details: 'document.visibilityState permanently resolved to "visible". Window blur event listeners neutralized.',
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'video',
      message: 'Detected Video.js player: video#id_videojs_6ac789afb47f9_1_html5_api',
      details: 'Source: MIT_ENS_Mod5_Overview (1).mp4 (Duration: 337.5s)',
    },
  ]);

  const addLog = useCallback(
    (type: AutomationLog['type'], message: string, details?: string) => {
      const newLog: AutomationLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        details,
      };
      setLogs((prev) => [...prev.slice(-49), newLog]);
    },
    []
  );

  const handleUpdateSettings = (newPartial: Partial<ExtensionSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      addLog('info', 'Updated extension settings', JSON.stringify(newPartial));
      return updated;
    });
  };

  // Keyboard shortcut listener (Alt+V, Alt+S, Alt+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setTriggerSkipCount((c) => c + 1);
        addLog('video', 'Shortcut Triggered: Alt+V (Quick Skip to 100%)');
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const nextSpeed = videoState.rate === 16 ? 1 : 16;
        setTriggerSpeed(nextSpeed);
        addLog('video', `Shortcut Triggered: Alt+S (Toggle ${nextSpeed}x Speed)`);
      } else if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setTriggerNextCount((c) => c + 1);
        addLog('navigation', 'Shortcut Triggered: Alt+N (Auto-Advance Next Activity)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoState.rate, addLog]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Application Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-lg text-white">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                  Universal Course & Video Auto-Completer
                </h1>
                <span className="bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                  v3.7.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Universal HTML5 & Video.js Completer &bull; Moodle &bull; Coursera &bull; Canvas &bull; Anti-Tab Lock
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>LMS Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'scripts'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>⚡ 1-Click Console Scripts</span>
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'source'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Extension Code</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Installation Guide</span>
            </button>
          </div>

          {/* One-Click Download ZIP Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadExtensionZip()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Extension (.ZIP)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full flex flex-col gap-6">
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            {/* Top Info Banner for Students */}
            <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-900/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100">
                    Live Universal Course & HTML5 Video Sandbox
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                    Test the extension against real HTML5 &amp; Video.js players (including your exact <code className="text-blue-400">video#id_videojs_6ac789afb47f9_1_html5_api</code> LMS setup). Use the floating widget on the right to complete videos, speed up, or bypass tab-lock in real time!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
                  Shortcuts: Alt+V &bull; Alt+S &bull; Alt+N
                </span>
              </div>
            </div>

            {/* Split View: Simulator (Left) + Extension Popup (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Simulator Component (9 cols on xl) */}
              <div className="xl:col-span-8 flex flex-col gap-4">
                <LmsSimulator
                  settings={settings}
                  onLog={addLog}
                  onVideoStateChange={setVideoState}
                  externalTriggerSkip={triggerSkipCount}
                  externalTriggerSpeed={triggerSpeed}
                  externalTriggerNext={triggerNextCount}
                />
              </div>

              {/* Extension Popup Widget (4 cols on xl) */}
              <div className="xl:col-span-4 flex flex-col gap-4 sticky top-20">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Interactive Extension Popup
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Hooked to active player
                  </span>
                </div>

                <ExtensionPopupWidget
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onTriggerSkipVideo={() => {
                    setTriggerSkipCount((c) => c + 1);
                    addLog('video', 'Popup Trigger: Skip Video to 100%');
                  }}
                  onTriggerSuperSpeed={(speed) => {
                    setTriggerSpeed(speed);
                    addLog('video', `Popup Trigger: Set Speed to ${speed}x`);
                  }}
                  onTriggerNextLesson={() => {
                    setTriggerNextCount((c) => c + 1);
                    addLog('navigation', 'Popup Trigger: Advance to Next Lesson');
                  }}
                  detectedVideosCount={videoState.count}
                  currentPlaybackRate={videoState.rate}
                  isVideoCompleted={videoState.isCompleted}
                  activeLmsName={videoState.lmsName}
                />

                {/* Key Shortcut Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Keyboard Hotkeys (Active in Browser)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <b className="text-blue-400">Alt + V</b>
                      <div className="text-[10px] text-slate-400">Skip to 100%</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <b className="text-amber-400">Alt + S</b>
                      <div className="text-[10px] text-slate-400">16x Speed</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <b className="text-indigo-400">Alt + N</b>
                      <div className="text-[10px] text-slate-400">Next Activity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Console Logger */}
            <ConsoleLogger logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="flex flex-col gap-4">
            <ConsoleScriptsViewer />
          </div>
        )}

        {activeTab === 'source' && (
          <div className="flex flex-col gap-4">
            <ExtensionFilesViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="flex flex-col gap-4">
            <InstallationGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
        <p>
          Universal Course & Video Auto-Completer &bull; Independent educational tool for study productivity &bull; MIT License
        </p>
      </footer>
    </div>
  );
}
export default App;
