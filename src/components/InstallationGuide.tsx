import React from 'react';
import { Download, CheckCircle, Globe, Laptop, Sparkles, Shield, Zap } from 'lucide-react';
import { downloadExtensionZip } from '../utils/extensionGenerator';

export const InstallationGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl text-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              How to Install Extension in Chrome / Edge / Brave
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Follow this 1-minute guide to load the extension and automate video lectures on your university LMS (MIT-WPU, Moodle, Coursera, Canvas).
          </p>
        </div>

        <button
          onClick={() => downloadExtensionZip()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Extension (.ZIP)</span>
        </button>
      </div>

      {/* Direct Fix for user's screenshot error */}
      <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <span>⚠️ Seeing "Could not load javascript 'dist/scripts/content.js' for script"?</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This error happens when you try to load the <b>broken GitHub zip</b> (<code className="text-red-300 bg-black/40 px-1 py-0.5 rounded font-mono">coursera-automation-extension-master</code>). The original repository on GitHub omitted its built files!
        </p>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-300 flex flex-col gap-1.5 font-medium">
          <span>✅ <b>How to fix in 10 seconds:</b></span>
          <span>1. Click the blue <b>"Download Extension (.ZIP)"</b> button above to download our fixed package.</span>
          <span>2. Extract <code className="text-white">Universal-Course-Video-Completer-v3.7.0.zip</code>.</span>
          <span>3. In <code className="text-white">chrome://extensions</code>, click <b>"Load unpacked"</b> and pick that extracted folder. It will load immediately with zero errors!</span>
        </div>
      </div>

      {/* Step by step cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30">
            1
          </div>
          <h4 className="font-semibold text-sm text-slate-100">Download & Extract</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the download button above to get <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded text-[11px]">Universal-Course-Video-Completer.zip</code> and extract it into a folder.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
            2
          </div>
          <h4 className="font-semibold text-sm text-slate-100">Open Extensions Page</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            In Chrome or Brave, type <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded text-[11px]">chrome://extensions</code> in the URL address bar and press Enter.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
            3
          </div>
          <h4 className="font-semibold text-sm text-slate-100">Load Unpacked</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enable <b>"Developer mode"</b> toggle (top right), then click <b>"Load unpacked"</b> (top left) and select the extracted folder.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-600/20 text-green-400 font-bold flex items-center justify-center text-xs border border-green-500/30">
            4
          </div>
          <h4 className="font-semibold text-sm text-slate-100">Ready to Use!</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Open any course or video. Press <b className="text-white">Alt + V</b> to skip to 100%, or click the floating HUD badge!
          </p>
        </div>
      </div>

      {/* Feature Highlights Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Engine Features Comparison</span>
          <span className="text-emerald-400">Universal Support</span>
        </div>
        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <b className="text-white">Universal HTML5 & Video.js Hook:</b>
                <span className="text-slate-400 ml-1.5">
                  Works on Moodle (MIT-WPU LMS), Video.js, Canvas, Coursera, Plyr, and any HTML5 player.
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold shrink-0">Included</span>
          </div>

          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <b className="text-white">Anti-Tab Lock / Focus Bypass:</b>
                <span className="text-slate-400 ml-1.5">
                  Overwrites <code className="text-blue-400">document.visibilityState</code> to always report 'visible', so LMS platforms cannot pause videos when you switch tabs or work elsewhere.
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold shrink-0">Included</span>
          </div>

          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <b className="text-white">Super Speed Controller (Up to 16x):</b>
                <span className="text-slate-400 ml-1.5">
                  Bypasses 2x player limitations, fast-forwarding lectures at 4x, 8x, or 16x with auto-mute.
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold shrink-0">Included</span>
          </div>

          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <b className="text-white">Auto-Advance to Next Activity:</b>
                <span className="text-slate-400 ml-1.5">
                  Detects Moodle "Next Activity", Canvas "Next", and Coursera "Next Item" buttons and auto-clicks them once the video finishes.
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold shrink-0">Included</span>
          </div>
        </div>
      </div>
    </div>
  );
};
