export interface ExtensionSettings {
  autoSkipVideo: boolean;
  superSpeedRate: number; // 1, 2, 4, 8, 16
  autoPlayOnLoad: boolean;
  autoMute: boolean;
  bypassTabLock: boolean; // Anti-proctor / prevent pause on tab switch
  autoAdvanceNext: boolean;
  autoCompleteReading: boolean;
  autoSolveQuizzes: boolean;
  actionDelayMs: number;
  platformTarget: 'all' | 'moodle' | 'coursera' | 'canvas';
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'video' | 'navigation' | 'bypass';
  message: string;
  details?: string;
}

export interface CourseModuleItem {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'discussion';
  duration?: string;
  completed: boolean;
  videoUrl?: string;
  lmsPlayerType?: 'videojs' | 'native' | 'coursera';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex?: number;
}
