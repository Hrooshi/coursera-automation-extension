import React, { useState, useRef, useEffect } from 'react';
import { CourseModuleItem, ExtensionSettings, QuizQuestion } from '../types';
import { SAMPLE_VIDEOS, MOODLE_MODULE_ITEMS, COURSERA_MODULE_ITEMS, SAMPLE_QUIZ_QUESTIONS } from '../data/mockCourseData';
import { 
  Play, Pause, Volume2, VolumeX, CheckCircle, AlertCircle, 
  FastForward, Shield, ArrowRight, BookOpen, HelpCircle, 
  MessageSquare, FileText, Sparkles, ExternalLink, RefreshCw 
} from 'lucide-react';

interface LmsSimulatorProps {
  settings: ExtensionSettings;
  onLog: (type: 'info' | 'success' | 'warning' | 'video' | 'navigation' | 'bypass', message: string, details?: string) => void;
  onVideoStateChange: (state: { count: number; rate: number; isCompleted: boolean; lmsName: string }) => void;
  externalTriggerSkip: number; // Increment counter to trigger skip from parent/popup
  externalTriggerSpeed: number; // Speed passed from parent/popup
  externalTriggerNext: number; // Trigger next activity
}

export const LmsSimulator: React.FC<LmsSimulatorProps> = ({
  settings,
  onLog,
  onVideoStateChange,
  externalTriggerSkip,
  externalTriggerSpeed,
  externalTriggerNext,
}) => {
  const [selectedLmsIndex, setSelectedLmsIndex] = useState(0);
  const activeVideoConfig = SAMPLE_VIDEOS[selectedLmsIndex];

  // Course modules state
  const [modules, setModules] = useState<CourseModuleItem[]>(
    selectedLmsIndex === 1 ? COURSERA_MODULE_ITEMS : MOODLE_MODULE_ITEMS
  );
  const [activeItemId, setActiveItemId] = useState<string>(modules[0].id);

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(activeVideoConfig.seconds);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [tabBlurred, setTabBlurred] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZ_QUESTIONS);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Discussion state
  const [discussionPosts, setDiscussionPosts] = useState<Array<{ author: string; time: string; text: string }>>([
    {
      author: 'Prof. David R.',
      time: '2 hours ago',
      text: 'Welcome to this module. Please share your reflections on how environmental constraints shape modern infrastructure projects.'
    }
  ]);
  const [myDiscussionInput, setMyDiscussionInput] = useState('');

  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchStep, setBatchStep] = useState<string>('');

  // Simulates running the Moodle Batch Console Script
  const runBatchUnlocker = async () => {
    setIsBatchRunning(true);
    onLog('info', '🚀 Started Moodle Batch Completer script simulation...');

    for (let i = 0; i < modules.length; i++) {
      const item = modules[i];
      setBatchStep(`Marking "${item.title}" as viewed...`);
      setActiveItemId(item.id);
      onLog('video', `[Batch Viewer] Visited: ${item.title}`, 'Satisfied Moodle server completion/view.php requirement');
      
      await new Promise(r => setTimeout(r, 600));

      setModules(prev => prev.map((m, idx) => idx <= i ? { ...m, completed: true } : m));
      if (item.type === 'video') {
        setIsVideoCompleted(true);
      }
    }

    setBatchStep('All course activities unlocked!');
    setIsBatchRunning(false);
    onLog('success', '🎉 Batch completion finished! All locked restrictions uncurled and satisfied.');
  };

  // Switch modules list when LMS changes
  useEffect(() => {
    const newItems = selectedLmsIndex === 1 ? COURSERA_MODULE_ITEMS : MOODLE_MODULE_ITEMS;
    setModules(newItems.map(m => ({ ...m, completed: false })));
    setActiveItemId(newItems[0].id);
    setIsVideoCompleted(false);
    setCurrentTime(0);
    setDuration(activeVideoConfig.seconds);
    setPlaybackRate(1);

    onLog(
      'info',
      `Switched LMS Environment to: ${activeVideoConfig.platform}`,
      `Target element: video#id_videojs_6ac789afb47f9_1_html5_api`
    );
  }, [selectedLmsIndex]);

  // Sync state upward
  useEffect(() => {
    onVideoStateChange({
      count: 1,
      rate: playbackRate,
      isCompleted: isVideoCompleted,
      lmsName: activeVideoConfig.platform
    });
  }, [playbackRate, isVideoCompleted, activeVideoConfig.platform]);

  // Listen for external trigger skips from Extension Popup
  useEffect(() => {
    if (externalTriggerSkip > 0) {
      completeCurrentVideo();
    }
  }, [externalTriggerSkip]);

  // Listen for external speed trigger
  useEffect(() => {
    if (externalTriggerSpeed > 0) {
      changeSpeed(externalTriggerSpeed);
    }
  }, [externalTriggerSpeed]);

  // Listen for external next trigger
  useEffect(() => {
    if (externalTriggerNext > 0) {
      advanceToNextItem();
    }
  }, [externalTriggerNext]);

  // Handle Tab Switch Simulation
  const simulateTabBlur = () => {
    setTabBlurred(true);
    if (!settings.bypassTabLock) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        onLog('warning', 'LMS Anti-Cheat Triggered: Video paused due to window blur (Tab switch detected)');
      }
    } else {
      onLog('bypass', 'Anti-Tab Lock Active: document.visibilityState bypassed! Video continues playing seamlessly.');
    }
  };

  const simulateTabFocus = () => {
    setTabBlurred(false);
    onLog('info', 'Window returned to focus.');
  };

  // Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // If reached end
      if (cur >= (videoRef.current.duration - 0.5) && !isVideoCompleted) {
        markVideoAsCompleted();
      }
    }
  };

  const markVideoAsCompleted = () => {
    setIsVideoCompleted(true);
    setModules(prev => prev.map(m => m.id === activeItemId ? { ...m, completed: true } : m));
    onLog(
      'success',
      '✅ 100% Video Completion Recorded!',
      'Fired standard events: timeupdate, seeking, seeked, ended. SCORM / Moodle requirements satisfied.'
    );

    if (settings.autoAdvanceNext) {
      onLog('navigation', 'Auto-advance enabled: navigating to next activity in 1.2s...');
      setTimeout(() => {
        advanceToNextItem();
      }, 1200);
    }
  };

  const completeCurrentVideo = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || activeVideoConfig.seconds;
      if (settings.autoMute) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
      // Seek directly to end - 0.2s
      videoRef.current.currentTime = Math.max(0, dur - 0.2);
      setCurrentTime(dur);
      videoRef.current.playbackRate = 16;
      setPlaybackRate(16);

      // Play briefly to satisfy LMS listeners
      videoRef.current.play().then(() => {
        markVideoAsCompleted();
      }).catch(() => {
        markVideoAsCompleted();
      });

      onLog('video', `⚡ Instantly skipped video to end (${dur.toFixed(1)}s).`);
    } else {
      setIsVideoCompleted(true);
      markVideoAsCompleted();
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      if (rate > 2 && settings.autoMute) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
    onLog('video', `⏩ Playback rate set to ${rate}x.`);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const advanceToNextItem = () => {
    const currentIndex = modules.findIndex(m => m.id === activeItemId);
    if (currentIndex < modules.length - 1) {
      const nextItem = modules[currentIndex + 1];
      setActiveItemId(nextItem.id);
      onLog('navigation', `⏭️ Loaded next course item: "${nextItem.title}"`);
    } else {
      onLog('success', '🎉 All course activities in this module are complete!');
    }
  };

  // Quiz auto solver
  const handleAutoSolveQuiz = () => {
    const solved = quizQuestions.map(q => ({
      ...q,
      selectedIndex: q.correctIndex
    }));
    setQuizQuestions(solved);
    setQuizScore(100);
    setModules(prev => prev.map(m => m.type === 'quiz' ? { ...m, completed: true } : m));
    onLog('success', '🎯 Auto-Solve Quiz: Selected 100% correct answers with AI heuristic matching!');
    if (settings.autoAdvanceNext) {
      setTimeout(advanceToNextItem, 1200);
    }
  };

  // Reading auto complete
  const handleCompleteReading = () => {
    setModules(prev => prev.map(m => m.id === activeItemId ? { ...m, completed: true } : m));
    onLog('success', '📖 Reading Auto-Completed: Scrolled to bottom & marked as read.');
    if (settings.autoAdvanceNext) {
      setTimeout(advanceToNextItem, 1000);
    }
  };

  // Discussion auto poster
  const handleAutoPostDiscussion = () => {
    const smartResponses = [
      'Great discussion prompt! In my experience, adaptive learning rates like Adam perform remarkably well when paired with warmup schedules, avoiding local saddle points effectively.',
      'Analyzing the trade-offs between computational overhead and environmental impact is essential for sustainable engineering frameworks.'
    ];
    const generated = smartResponses[Math.floor(Math.random() * smartResponses.length)];
    setDiscussionPosts(prev => [
      ...prev,
      { author: 'Student (Automated)', time: 'Just now', text: generated }
    ]);
    setMyDiscussionInput('');
    setModules(prev => prev.map(m => m.type === 'discussion' ? { ...m, completed: true } : m));
    onLog('success', '💬 Auto-Posted insightful forum response & marked activity completed.');
  };

  const activeItem = modules.find(m => m.id === activeItemId) || modules[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* LMS Target Switcher & Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select LMS Platform:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {SAMPLE_VIDEOS.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedLmsIndex(index)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  selectedLmsIndex === index
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.lms === 'moodle' ? '🎓 Moodle (MIT-WPU Video.js)' : item.lms === 'coursera' ? '📘 Coursera' : '📙 Canvas LMS'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Lock Simulator Test */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Test Anti-Tab-Lock:</span>
          <button
            onMouseDown={simulateTabBlur}
            onMouseUp={simulateTabFocus}
            onMouseLeave={simulateTabFocus}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              tabBlurred
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${settings.bypassTabLock ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{tabBlurred ? 'Simulating Tab Switched Out...' : 'Hold to Simulate Tab Switch'}</span>
          </button>
        </div>
      </div>

      {/* Main LMS Classroom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 cols: Course Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* LMS Classroom Breadcrumbs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">{activeVideoConfig.platform}</span>
              <span>&rsaquo;</span>
              <span>Modules</span>
              <span>&rsaquo;</span>
              <span className="text-blue-400 font-medium truncate max-w-sm">{activeItem.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {activeItem.completed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5" /> Required to Pass
                </span>
              )}
            </div>
          </div>

          {/* ACTIVE CONTENT VIEW */}
          {activeItem.type === 'video' ? (
            /* Video Lecture Classroom (Matching exact Video.js structure from user's devtools trace!) */
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              {/* VIDEO CONTAINER with exact ID from user prompt */}
              <div 
                id="id_videojs_6ac789afb47f9_1" 
                className="relative bg-black w-full aspect-video flex items-center justify-center group overflow-hidden"
              >
                {/* Real HTML5 Video element */}
                <video
                  ref={videoRef}
                  id="id_videojs_6ac789afb47f9_1_html5_api"
                  src={activeVideoConfig.url}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration || activeVideoConfig.seconds;
                    setDuration(dur);
                    onLog('video', `[Video.js Detected] Media loaded. Duration: ${dur.toFixed(1)}s`);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* THE EXTENSION HUD OVERLAY (Simulating content.js on-screen badge) */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-blue-500/50 shadow-xl rounded-full px-2.5 py-1 text-xs">
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    ⚡ Auto-Completer
                  </span>
                  <button
                    onClick={completeCurrentVideo}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer"
                    title="Instantly complete video (Alt+V)"
                  >
                    ⚡ Skip
                  </button>
                  <button
                    onClick={() => changeSpeed(playbackRate === 16 ? 1 : 16)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer border border-amber-500/30"
                    title="16x Super Speed (Alt+S)"
                  >
                    {playbackRate}x
                  </button>
                  <button
                    onClick={advanceToNextItem}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer"
                    title="Next Activity (Alt+N)"
                  >
                    ⏭️ Next
                  </button>
                </div>

                {/* Tab switch warning overlay (if anti-tab lock was disabled) */}
                {tabBlurred && !settings.bypassTabLock && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                    <h4 className="text-red-400 font-bold text-base">LMS Tab-Lock Violation Detected</h4>
                    <p className="text-slate-300 text-xs max-w-sm mt-1">
                      The university LMS detected you navigated away from this tab and automatically paused the video.
                    </p>
                    <span className="mt-3 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                      💡 Tip: Enable "Anti-Tab Lock" in the extension to bypass this!
                    </span>
                  </div>
                )}

                {/* Custom Video Controls bar (representing Video.js .vjs-control-bar) */}
                <div className="vjs-control-bar absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Progress bar */}
                  <div 
                    className="w-full bg-slate-700/60 h-1.5 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      if (videoRef.current) {
                        videoRef.current.currentTime = ratio * duration;
                      }
                    }}
                  >
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlayPause} className="hover:text-blue-400 transition-colors cursor-pointer">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }} 
                        className="hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <span className="font-mono text-[11px] text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase">Speed:</span>
                      {[1, 2, 4, 16].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changeSpeed(rate)}
                          className={`text-[11px] px-1.5 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                            playbackRate === rate ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info and LMS Verification Card */}
              <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900 border-t border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">{activeVideoConfig.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>Source: <code className="text-blue-400 font-mono text-[11px]">{activeVideoConfig.url.split('/').pop()}</code></span>
                    <span>&bull;</span>
                    <span>Duration: <b className="text-slate-200">{formatTime(duration)}</b></span>
                    <span>&bull;</span>
                    <span>DOM: <code className="text-slate-300 font-mono text-[11px]">video#id_videojs_6ac789afb47f9_1_html5_api</code></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={completeCurrentVideo}
                    className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Instant Skip (100%)</span>
                  </button>
                  <button
                    onClick={advanceToNextItem}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : activeItem.type === 'reading' ? (
            /* Reading Classroom Item */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-base">{activeItem.title}</h3>
                </div>
                <button
                  onClick={handleCompleteReading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Auto-Complete & Mark Done</span>
                </button>
              </div>

              <div className="prose prose-invert text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex flex-col gap-2.5">
                <p>
                  <b>1. Overview of Optimization Formulations:</b> In classical machine learning and environmental engineering models, optimization involves minimizing an objective loss function <i>L(&theta;)</i> across millions of parameters.
                </p>
                <p>
                  <b>2. First-Order vs Second-Order:</b> First-order algorithms like SGD track gradient slope &nabla;L, while adaptive routines maintain exponential moving averages of both past gradients and squared gradients.
                </p>
                <p>
                  <b>3. Student Completion Check:</b> Educational LMS servers verify reading engagement through continuous scroll position tracking and elapsed reading duration timer hooks. The Coursera & LMS Completer triggers scroll events to the very bottom and fires the completion flag.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleCompleteReading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark as Done
                </button>
              </div>
            </div>
          ) : activeItem.type === 'quiz' ? (
            /* Quiz Assessment Classroom Item */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{activeItem.title}</h3>
                    <span className="text-[11px] text-slate-400">Passing threshold: 80% &bull; 3 questions</span>
                  </div>
                </div>
                <button
                  onClick={handleAutoSolveQuiz}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Solve Quiz (100% Score)</span>
                </button>
              </div>

              {quizScore !== null && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Quiz Passed! Final Grade: {quizScore}% (Satisfies course completion)
                  </span>
                  <button
                    onClick={() => { setQuizScore(null); setQuizQuestions(SAMPLE_QUIZ_QUESTIONS); }}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-slate-200 mb-2.5">
                      Question {idx + 1}: {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = q.selectedIndex === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setQuizQuestions(prev => prev.map(item => item.id === q.id ? { ...item, selectedIndex: oIdx } : item));
                            }}
                            className={`text-left px-3 py-2 rounded-md border text-xs transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200'
                                  : 'bg-red-950/50 border-red-500/70 text-red-200'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && isCorrect && <span className="text-[10px] text-emerald-400 font-bold">✓ Correct</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleAutoSolveQuiz}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Submit Auto-Completed Answers
                </button>
              </div>
            </div>
          ) : (
            /* Discussion Forum Classroom Item */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-slate-100 text-base">{activeItem.title}</h3>
                </div>
                <button
                  onClick={handleAutoPostDiscussion}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Draft & Post Reply</span>
                </button>
              </div>

              {/* Discussion Thread */}
              <div className="flex flex-col gap-2.5">
                {discussionPosts.map((post, pIdx) => (
                  <div key={pIdx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-200">{post.author}</span>
                      <span>{post.time}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{post.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <textarea
                  value={myDiscussionInput}
                  onChange={(e) => setMyDiscussionInput(e.target.value)}
                  placeholder="Draft your discussion reflection here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleAutoPostDiscussion}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Post Response
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 col: Course Navigation & Module Progress */}
        <div className="flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Module Outline</h4>
              <span className="text-[11px] text-blue-400 font-mono">
                {modules.filter(m => m.completed).length} / {modules.length} Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(modules.filter(m => m.completed).length / modules.length) * 100}%` }}
              />
            </div>

            {/* Run Batch Completer Button */}
            <button
              onClick={runBatchUnlocker}
              disabled={isBatchRunning}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBatchRunning ? batchStep || 'Running Batch Viewer...' : '⚡ Run 1-Click Batch Unlocker'}</span>
            </button>

            {/* Module Items List */}
            <div className="flex flex-col gap-2">
              {modules.map((item, idx) => {
                const isActive = item.id === activeItemId;
                // Determine if item is locked based on previous item completion
                const isLocked = selectedLmsIndex === 0 && idx > 0 && !modules[idx - 1].completed && !item.completed;
                const prevItemTitle = idx > 0 ? modules[idx - 1].title : '';

                return (
                  <div key={item.id} className="flex flex-col gap-1">
                    <button
                      onClick={() => !isLocked && setActiveItemId(item.id)}
                      disabled={isLocked}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 cursor-pointer ${
                        isLocked
                          ? 'opacity-60 bg-slate-950/30 border-slate-850 text-slate-500 cursor-not-allowed'
                          : isActive
                          ? 'bg-blue-600/10 border-blue-500/60 text-white shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : isLocked ? (
                          <AlertCircle className="w-4 h-4 text-slate-500" />
                        ) : item.type === 'video' ? (
                          <Play className="w-4 h-4 text-blue-400" />
                        ) : item.type === 'reading' ? (
                          <BookOpen className="w-4 h-4 text-amber-400" />
                        ) : item.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate leading-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{item.duration}</span>
                          {item.completed && <span className="text-emerald-400 font-semibold">• Done</span>}
                          {isLocked && <span className="text-amber-400 font-semibold">• Locked</span>}
                        </div>
                      </div>
                    </button>

                    {/* Moodle Restriction Lock Box matching user's screenshot */}
                    {isLocked && (
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded px-2.5 py-1 text-[10px] text-slate-400 flex items-center gap-1.5 leading-snug">
                        <span>🔒</span>
                        <span>
                          Not available unless: The activity <b className="text-slate-300">{prevItemTitle}</b> is marked complete
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete All Activities Button */}
            <button
              onClick={() => {
                setModules(prev => prev.map(m => ({ ...m, completed: true })));
                setIsVideoCompleted(true);
                onLog('success', '🏆 All module activities marked as 100% completed!');
              }}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Complete Entire Course</span>
            </button>
          </div>

          {/* DevTools DOM Inspector Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs flex flex-col gap-2 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Live DOM Inspection</span>
              <span className="text-emerald-400">Hooked</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex flex-col gap-1 overflow-x-auto">
              <div><span className="text-blue-400">tag:</span> &lt;video&gt;</div>
              <div><span className="text-blue-400">id:</span> <span className="text-amber-300">"id_videojs_6ac789afb47f9_1_html5_api"</span></div>
              <div><span className="text-blue-400">container:</span> <span className="text-slate-400">"div#id_videojs_6ac789afb47f9_1"</span></div>
              <div><span className="text-blue-400">duration:</span> <span className="text-emerald-400">{duration.toFixed(1)}s</span></div>
              <div><span className="text-blue-400">currentTime:</span> <span className="text-indigo-400">{currentTime.toFixed(1)}s</span></div>
              <div><span className="text-blue-400">playbackRate:</span> <span className="text-amber-400">{playbackRate}x</span></div>
              <div><span className="text-blue-400">visibilityState:</span> <span className="text-emerald-400">"visible" (Bypassed)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
