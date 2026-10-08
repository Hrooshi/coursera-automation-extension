import { CourseModuleItem, QuizQuestion } from '../types';

export const SAMPLE_VIDEOS = [
  {
    name: 'University LMS Lecture (MIT WPU Video.js)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'MIT_ENS_Mod5_Overview: Environmental Engineering Systems',
    duration: '05:37',
    seconds: 337.5,
    lms: 'moodle' as const,
    platform: 'MIT-WPU Moodle LMS (lms.mitwpu.edu.in)'
  },
  {
    name: 'Coursera ML & Neural Networks Lecture',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Lecture 4.2: Backpropagation and Gradient Descent Convergence',
    duration: '10:54',
    seconds: 654,
    lms: 'coursera' as const,
    platform: 'Coursera (coursera.org)'
  },
  {
    name: 'Canvas LMS Computer Science Workshop',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Module 3: Distributed Systems Architecture & Raft Consensus',
    duration: '02:15',
    seconds: 135,
    lms: 'canvas' as const,
    platform: 'Canvas LMS (canvas.instructure.com)'
  }
];

export const MOODLE_MODULE_ITEMS: CourseModuleItem[] = [
  {
    id: 'moodle-1',
    title: 'MIT_ENS_Mod5_Overview (1).mp4',
    type: 'video',
    duration: '5m 37s',
    completed: false,
    lmsPlayerType: 'videojs'
  },
  {
    id: 'moodle-2',
    title: 'Module 5 Reading: Environmental Impact Analysis Guidelines',
    type: 'reading',
    duration: '12 min',
    completed: false
  },
  {
    id: 'moodle-3',
    title: 'Graded Assessment: Module 5 Comprehension Check',
    type: 'quiz',
    duration: '15 min',
    completed: false
  },
  {
    id: 'moodle-4',
    title: 'Class Discussion Forum: Sustainable Urban Frameworks',
    type: 'discussion',
    duration: '1 post required',
    completed: false
  }
];

export const COURSERA_MODULE_ITEMS: CourseModuleItem[] = [
  {
    id: 'coursera-1',
    title: 'Neural Networks: Mathematical Foundations & Loss Gradients',
    type: 'video',
    duration: '10m 54s',
    completed: false,
    lmsPlayerType: 'coursera'
  },
  {
    id: 'coursera-2',
    title: 'Reading: Stochastic Gradient Descent Variations & Optimizers',
    type: 'reading',
    duration: '15 min',
    completed: false
  },
  {
    id: 'coursera-3',
    title: 'Week 2 Graded Quiz: Optimizer Performance',
    type: 'quiz',
    duration: '20 min',
    completed: false
  },
  {
    id: 'coursera-4',
    title: 'Discussion Prompt: Learning Rate Decay Schedules in Deep Learning',
    type: 'discussion',
    duration: 'Graded dialogue',
    completed: false
  }
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which optimization algorithm adapts learning rates based on second-order moments of the gradients?',
    options: [
      'Standard Batch Gradient Descent',
      'Adam (Adaptive Moment Estimation)',
      'Perceptron Learning Rule',
      'Stochastic Hill Climbing'
    ],
    correctIndex: 1,
    explanation: 'Adam computes individual adaptive learning rates for different parameters from estimates of first and second moments of the gradients.'
  },
  {
    id: 2,
    question: 'In HTML5 video elements, which event is fired when playback reaches the end of the media source?',
    options: [
      'playbackFinished',
      'ended',
      'completed',
      'onMediaStop'
    ],
    correctIndex: 1,
    explanation: 'The standard HTML5 specification fires the "ended" event on HTMLMediaElement when playback has stopped at the end of the media.'
  },
  {
    id: 3,
    question: 'How do learning management systems (LMS) typically verify that a student watched a mandatory video lecture?',
    options: [
      'Listening for timeupdate events and checking currentTime >= duration before issuing the completion flag',
      'Relying solely on whether the browser tab was opened',
      'Checking web camera facial tracking without user permission',
      'By only counting mouse hovering coordinates'
    ],
    correctIndex: 0,
    explanation: 'Most LMS video plugins (Video.js, SCORM, Moodle media) monitor timeupdate events and verify that the currentTime reaches the duration threshold (typically 90% to 100%).'
  }
];
