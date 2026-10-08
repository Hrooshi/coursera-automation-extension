import React from 'react';
import { ExtensionSettings } from '../types';
import { Zap, FastForward, SkipForward, Shield, VolumeX, BookOpen, CheckCircle2, Sliders } from 'lucide-react';

interface ExtensionPopupWidgetProps {
  settings: ExtensionSettings;
  onUpdateSettings: (newSettings: Partial<ExtensionSettings>) => void;
  onTriggerSkipVideo: () => void;
  onTriggerSuperSpeed: (speed: number) => void;
  onTriggerNextLesson: () => void;
  onTriggerCompleteReading?: () => void;
  onTriggerSolveQuiz?: () => void;
  detectedVideosCount: number;
  currentPlaybackRate: number;
  isVideoCompleted: boolean;
  activeLmsName: string;
}

export const ExtensionPopupWidget: React.FC<ExtensionPopupWidgetProps> = ({
  settings,
  onUpdateSettings,
  onTriggerSkipVideo,
  onTriggerSuperSpeed,
  onTriggerNextLesson,
  onTriggerCompleteReading,
  onTriggerSolveQuiz,
  detectedVideosCount,
  currentPlaybackRate,
  isVideoCompleted,
  activeLmsName,
}) => {
  return (
    <div className="w-80 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col gap-3.5 select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white leading-none">Universal Completer</h3>
            <span className="text-[10px] text-blue-400 font-medium">Any LMS & HTML5 Video</span>
          </div>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
          v3.7.0
        </span>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onTriggerSkipVideo}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-xs cursor-pointer"
      >
        <Zap className="w-4 h-4 fill-white" />
        <span>Complete Video Instantly (100%)</span>
      </button>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onTriggerSuperSpeed(settings.superSpeedRate === 16 ? 1 : 16)}
          className={`py-2 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentPlaybackRate > 1
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
          }`}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{currentPlaybackRate > 1 ? `${currentPlaybackRate}x Active` : '16x Speed'}</span>
        </button>

        <button
          onClick={onTriggerNextLesson}
          className="py-2 px-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-slate-600"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Next Activity</span>
        </button>
      </div>

      {/* Optional Course Handlers */}
      <div className="grid grid-cols-2 gap-2">
        {onTriggerSolveQuiz && (
          <button
            onClick={onTriggerSolveQuiz}
            className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-900/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>Auto-Solve Quiz</span>
          </button>
        )}
        {onTriggerCompleteReading && (
          <button
            onClick={onTriggerCompleteReading}
            className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-900/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-emerald-400" />
            <span>Mark Reading Done</span>
          </button>
        )}
      </div>

      {/* Automation Mode Toggles */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Automation Modes</span>
          <Sliders className="w-3 h-3 text-slate-500" />
        </div>

        {/* Anti-Tab Lock Toggle */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200">Anti-Tab Lock</span>
            <span className="text-[10px] text-slate-400">(Never pauses)</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ bypassTabLock: !settings.bypassTabLock })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              settings.bypassTabLock ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.bypassTabLock ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Auto-Advance Next Toggle */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <SkipForward className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200">Auto-Advance Next</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoAdvanceNext: !settings.autoAdvanceNext })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              settings.autoAdvanceNext ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.autoAdvanceNext ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Auto-Mute Toggle */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200">Auto-Mute on Speed</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoMute: !settings.autoMute })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              settings.autoMute ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.autoMute ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Live Page Status Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-[11px] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Target LMS:</span>
          <span className="font-semibold text-blue-400 truncate max-w-[160px]">{activeLmsName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">HTML5 Videos:</span>
          <span className="font-medium text-slate-200">
            {detectedVideosCount} detected {isVideoCompleted ? '• 100% Complete' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Playback Rate:</span>
          <span className="font-mono text-emerald-400">{currentPlaybackRate}x</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2 border-t border-slate-800/60 pt-2">
        <span><b className="text-slate-300">Alt+V</b> Skip</span>
        <span>&bull;</span>
        <span><b className="text-slate-300">Alt+S</b> 16x</span>
        <span>&bull;</span>
        <span><b className="text-slate-300">Alt+N</b> Next</span>
      </div>
    </div>
  );
};
