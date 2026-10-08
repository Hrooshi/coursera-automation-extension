import JSZip from 'jszip';

export interface ExtensionFile {
  path: string;
  name: string;
  description: string;
  language: string;
  content: string;
}

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    path: 'manifest.json',
    name: 'manifest.json',
    description: 'Manifest V3 configuration with universal <all_urls> permission for any LMS & website',
    language: 'json',
    content: `{
  "manifest_version": 3,
  "name": "Universal Course & Video Auto-Completer",
  "version": "3.7.0",
  "author": "Universal Education Automation",
  "description": "Instantly skip, complete, and speed up HTML5 & Video.js videos on any course platform (Moodle, Coursera, Canvas, Blackboard, edX, etc.) with tab-lock bypass.",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "run_at": "document_start",
      "js": ["content.js"],
      "css": ["content.css"],
      "all_frames": true
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["injected.js"],
      "matches": ["<all_urls>"]
    }
  ],
  "commands": {
    "quick_complete_video": {
      "suggested_key": {
        "default": "Alt+V",
        "mac": "Command+Shift+V"
      },
      "description": "Instantly complete all HTML5 videos on current page"
    },
    "toggle_super_speed": {
      "suggested_key": {
        "default": "Alt+S",
        "mac": "Command+Shift+S"
      },
      "description": "Toggle 16x video playback speed"
    },
    "auto_advance_next": {
      "suggested_key": {
        "default": "Alt+N",
        "mac": "Command+Shift+N"
      },
      "description": "Trigger next course activity / lesson button"
    }
  }
}`
  },
  {
    path: 'content.js',
    name: 'content.js',
    description: 'Universal content script detecting HTML5 & Video.js videos, triggering completion events & auto-advance',
    language: 'javascript',
    content: `// Universal Course & Video Auto-Completer - Content Script
(function () {
  'use strict';

  console.log('[AutoCompleter] Universal Video & Course Completer initialized.');

  // Inject anti-tab-lock & Video.js bypass script into page context
  function injectBypassScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
  }
  injectBypassScript();

  let settings = {
    autoSkipVideo: true,
    superSpeedRate: 16,
    autoPlayOnLoad: true,
    autoMute: true,
    bypassTabLock: true,
    autoAdvanceNext: true
  };

  // Sync settings with chrome.storage
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(settings, (items) => {
      if (items) settings = { ...settings, ...items };
      processAllVideos();
    });
  }

  // Find all HTML5 video elements (including nested & shadow DOM)
  function getAllVideos() {
    const videos = Array.from(document.querySelectorAll('video'));
    // Also search common videojs containers
    document.querySelectorAll('.video-js, [id*="videojs"]').forEach(container => {
      const v = container.querySelector('video');
      if (v && !videos.includes(v)) videos.push(v);
    });
    return videos;
  }

  // Complete a single video element safely and trigger LMS completion events
  window.__completeHtml5Video = function (video) {
    if (!video) return;

    try {
      if (settings.autoMute) {
        video.muted = true;
      }

      // If duration is available, seek to near the very end
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        const targetTime = Math.max(0, video.duration - 0.2);
        
        // Start playback briefly so LMS tracking hooks wake up
        video.currentTime = targetTime;
        video.playbackRate = 16.0;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Fire sequence of HTML5 media events
            video.dispatchEvent(new Event('timeupdate', { bubbles: true }));
            video.dispatchEvent(new Event('seeking', { bubbles: true }));
            video.dispatchEvent(new Event('seeked', { bubbles: true }));
            
            // Advance to exact end
            video.currentTime = video.duration;
            video.dispatchEvent(new Event('timeupdate', { bubbles: true }));
            video.dispatchEvent(new Event('ended', { bubbles: true }));
            video.dispatchEvent(new Event('pause', { bubbles: true }));
            
            showToast('✅ Video marked 100% completed!');
            
            if (settings.autoAdvanceNext) {
              setTimeout(tryAutoAdvance, 1200);
            }
          }).catch(() => {
            // If play blocked by browser policy, dispatch ended directly
            video.currentTime = video.duration;
            video.dispatchEvent(new Event('ended', { bubbles: true }));
            showToast('✅ Video completion triggered!');
          });
        }
      } else {
        // Wait for metadata loaded
        video.addEventListener('loadedmetadata', () => {
          window.__completeHtml5Video(video);
        }, { once: true });
        video.play().catch(() => {});
      }
    } catch (e) {
      console.error('[AutoCompleter] Error completing video:', e);
    }
  };

  // Set super speed rate
  window.__setVideoSpeed = function (video, speed) {
    if (!video) return;
    video.playbackRate = speed;
    showToast(\`⏩ Video playback speed: \${speed}x\`);
  };

  // Find next button across Moodle, Coursera, Canvas, Blackboard, etc.
  function tryAutoAdvance() {
    const nextSelectors = [
      // Moodle LMS / MIT-WPU LMS Book & Activity Navigation
      '.nav-next a',
      'a.nav-next',
      '.arrow_link.next',
      'a[title*="Next chapter"]',
      'a[aria-label*="Next chapter"]',
      '.book-next a',
      '[data-action="next-chapter"]',
      '.activity-navigation .next-activity a',
      '.activity-navigation a[title*="Next"]',
      '#next-activity-link',
      '.mod_quiz-next-nav',
      'a.btn.btn-primary:has-text("Next")',
      // Canvas LMS
      '.module-sequence-footer a.btn[aria-label*="Next"]',
      'a.module-sequence-footer-button--next',
      // Coursera
      'button[aria-label="Next Item"]',
      'button[data-e2e="next-item"]',
      'button.c-item-control-next',
      // Generic
      'button.next-button',
      'a.next-button',
      'button:has-text("Complete and continue")',
      'button:has-text("Mark as done")'
    ];

    for (const sel of nextSelectors) {
      try {
        const btn = document.querySelector(sel);
        if (btn && btn.offsetParent !== null) {
          console.log('[AutoCompleter] Clicking next button:', btn);
          showToast('⏭️ Auto-advancing to next lesson...');
          btn.click();
          return true;
        }
      } catch (err) {}
    }

    // XPath fallback for buttons containing "Next" or "Continue"
    const xpathExpressions = [
      "//button[contains(translate(text(), 'NEXT', 'next'), 'next')]",
      "//a[contains(translate(text(), 'NEXT', 'next'), 'next')]",
      "//button[contains(translate(text(), 'CONTINUE', 'continue'), 'continue')]",
      "//button[contains(translate(text(), 'MARK AS DONE', 'mark as done'), 'mark as done')]"
    ];

    for (const xpath of xpathExpressions) {
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      if (result.singleNodeValue && result.singleNodeValue.offsetParent !== null) {
        showToast('⏭️ Found Next button, advancing...');
        result.singleNodeValue.click();
        return true;
      }
    }

    return false;
  }

  // Show floating mini HUD on top of detected video
  function attachOverlayToVideo(video) {
    if (video.dataset.completerAttached) return;
    video.dataset.completerAttached = 'true';

    const container = video.parentElement || document.body;
    const hud = document.createElement('div');
    hud.className = 'auto-completer-video-hud';
    hud.innerHTML = \`
      <div class="hud-pill">
        <span class="hud-badge">⚡ Auto-Completer</span>
        <button class="hud-btn hud-btn-skip" title="Complete Video Instantly (Alt+V)">⚡ Skip</button>
        <button class="hud-btn hud-btn-speed" title="16x Super Speed">16x</button>
        <button class="hud-btn hud-btn-next" title="Next Activity">⏭️ Next</button>
      </div>
    \`;

    hud.querySelector('.hud-btn-skip').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.__completeHtml5Video(video);
    });

    hud.querySelector('.hud-btn-speed').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const currentSpeed = video.playbackRate;
      const nextSpeed = currentSpeed === 16 ? 1 : (currentSpeed >= 4 ? 16 : 4);
      window.__setVideoSpeed(video, nextSpeed);
      hud.querySelector('.hud-btn-speed').textContent = nextSpeed + 'x';
    });

    hud.querySelector('.hud-btn-next').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      tryAutoAdvance();
    });

    // Append near the video
    if (container.style.position !== 'absolute' && container.style.position !== 'relative') {
      container.style.position = 'relative';
    }
    container.appendChild(hud);
  }

  function processAllVideos() {
    const videos = getAllVideos();
    videos.forEach(video => {
      attachOverlayToVideo(video);
      if (settings.autoPlayOnLoad && video.paused) {
        video.muted = settings.autoMute;
        video.play().catch(() => {});
      }
      if (settings.autoSkipVideo) {
        // Auto complete when video is ready
        if (video.readyState >= 1) {
          window.__completeHtml5Video(video);
        } else {
          video.addEventListener('loadeddata', () => {
            window.__completeHtml5Video(video);
          }, { once: true });
        }
      }
    });
  }

  // Periodic scanner for dynamically loaded videos (SPAs, Video.js, LMS)
  const observer = new MutationObserver(() => {
    const videos = getAllVideos();
    videos.forEach(attachOverlayToVideo);
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAllVideos);
  } else {
    processAllVideos();
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_PAGE_STATUS') {
      const videos = getAllVideos();
      sendResponse({
        videoCount: videos.length,
        hasVideoJs: !!document.querySelector('.video-js, [id*="videojs"]'),
        url: window.location.href,
        title: document.title
      });
    } else if (request.action === 'SKIP_ALL_VIDEOS') {
      const videos = getAllVideos();
      videos.forEach(window.__completeHtml5Video);
      sendResponse({ count: videos.length });
    } else if (request.action === 'SET_SPEED') {
      const videos = getAllVideos();
      videos.forEach(v => window.__setVideoSpeed(v, request.speed));
      sendResponse({ count: videos.length });
    } else if (request.action === 'CLICK_NEXT') {
      const success = tryAutoAdvance();
      sendResponse({ success });
    }
    return true;
  });

  function showToast(msg) {
    let toast = document.getElementById('auto-completer-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'auto-completer-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'show';
    setTimeout(() => {
      toast.className = '';
    }, 2800);
  }
})();`
  },
  {
    path: 'injected.js',
    name: 'injected.js',
    description: 'Page-context injection script bypassing LMS anti-tab-switch pausing and hooking into Video.js players',
    language: 'javascript',
    content: `// Injected into web page window context
(function () {
  'use strict';

  // 1. BYPASS ANTI-TAB-LOCK & VISIBILITY DETECTION
  // Forces document.hidden to false and document.visibilityState to 'visible'
  try {
    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true
    });
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true
    });
    Object.defineProperty(document, 'webkitHidden', {
      get: () => false,
      configurable: true
    });
    Object.defineProperty(document, 'webkitVisibilityState', {
      get: () => 'visible',
      configurable: true
    });

    // Suppress blur & visibilitychange events from pausing video
    const blockEvents = ['visibilitychange', 'webkitvisibilitychange', 'blur'];
    blockEvents.forEach(evtName => {
      window.addEventListener(evtName, (e) => {
        e.stopImmediatePropagation();
      }, true);
      document.addEventListener(evtName, (e) => {
        e.stopImmediatePropagation();
      }, true);
    });

    console.log('[AutoCompleter] Anti-Tab-Lock bypass active. Tab switching will not pause LMS videos.');
  } catch (err) {
    console.warn('[AutoCompleter] Visibility override warning:', err);
  }

  // 2. VIDEO.JS DIRECT PLAYER HOOK
  // Hooks into window.videojs if available on Moodle/LMS
  function hookVideoJs() {
    if (window.videojs) {
      const originalVideojs = window.videojs;
      window.__autoCompleteAllVideoJs = function () {
        const players = window.videojs.getPlayers ? window.videojs.getPlayers() : {};
        for (const id in players) {
          const player = players[id];
          if (player && typeof player.duration === 'function') {
            const dur = player.duration();
            if (dur && dur > 0) {
              player.currentTime(dur - 0.2);
              player.trigger('timeupdate');
              player.trigger('ended');
              console.log('[AutoCompleter] Triggered Video.js completion on player:', id);
            }
          }
        }
      };
    }
  }

  hookVideoJs();
  window.addEventListener('load', hookVideoJs);
})();`
  },
  {
    path: 'content.css',
    name: 'content.css',
    description: 'Overlay CSS for the floating controller badge on HTML5 & Video.js players',
    language: 'css',
    content: `/* Floating HUD overlay on videos */
.auto-completer-video-hud {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.hud-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
}

.hud-badge {
  color: #60a5fa;
  font-weight: 600;
  padding: 0 4px;
}

.hud-btn {
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 4px 10px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.hud-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.hud-btn-skip {
  background: #3b82f6;
}

.hud-btn-skip:hover {
  background: #1d4ed8;
}

/* Toast notifications */
#auto-completer-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483647;
  background: rgba(15, 23, 42, 0.95);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

#auto-completer-toast.show {
  opacity: 1;
  transform: translateY(0);
}`
  },
  {
    path: 'background.js',
    name: 'background.js',
    description: 'Extension background service worker handling global keyboard shortcuts and badge state',
    language: 'javascript',
    content: `// Extension background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Universal Course & Video Auto-Completer installed.');
  chrome.storage.sync.set({
    autoSkipVideo: true,
    superSpeedRate: 16,
    autoPlayOnLoad: true,
    autoMute: true,
    bypassTabLock: true,
    autoAdvanceNext: true
  });
});

// Handle keyboard shortcuts (Alt+V, Alt+S, Alt+N)
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (command === 'quick_complete_video') {
    chrome.tabs.sendMessage(tab.id, { action: 'SKIP_ALL_VIDEOS' });
  } else if (command === 'toggle_super_speed') {
    chrome.tabs.sendMessage(tab.id, { action: 'SET_SPEED', speed: 16 });
  } else if (command === 'auto_advance_next') {
    chrome.tabs.sendMessage(tab.id, { action: 'CLICK_NEXT' });
  }
});`
  },
  {
    path: 'popup.html',
    name: 'popup.html',
    description: 'Extension popup user interface with toggles, quick actions, speed selector, and live status',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course & Video Completer</title>
  <style>
    body {
      width: 330px;
      margin: 0;
      padding: 16px;
      background: #0f172a;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      font-size: 18px;
      background: #2563eb;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }
    .title {
      font-weight: 700;
      font-size: 14px;
      color: #f8fafc;
    }
    .version {
      font-size: 10px;
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      color: #94a3b8;
    }
    .btn-main {
      width: 100%;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      border: none;
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      transition: all 0.2s;
    }
    .btn-main:hover {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      transform: translateY(-1px);
    }
    .quick-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 10px 0 14px 0;
    }
    .btn-secondary {
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #fff;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin: 12px 0 8px 0;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
    }
    .toggle-label {
      color: #e2e8f0;
      font-size: 12px;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #334155;
      transition: .2s;
      border-radius: 20px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #2563eb;
    }
    input:checked + .slider:before {
      transform: translateX(16px);
    }
    .status-box {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 12px;
    }
    .status-highlight {
      color: #38bdf8;
      font-weight: 600;
    }
    .shortcut-hint {
      font-size: 10px;
      color: #64748b;
      text-align: center;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo-icon">⚡</div>
      <div>
        <div class="title">Course Completer</div>
      </div>
    </div>
    <span class="version">v3.7.0</span>
  </div>

  <button id="btnSkipAll" class="btn-main">
    <span>⚡ Complete All Videos (100%)</span>
  </button>

  <div class="quick-row">
    <button id="btnSpeed16" class="btn-secondary">⏩ 16x Super Speed</button>
    <button id="btnNext" class="btn-secondary">⏭️ Next Activity</button>
  </div>

  <div class="section-title">Automation Modes</div>
  <div class="toggle-row">
    <span class="toggle-label">Auto-Complete on page load</span>
    <label class="switch">
      <input type="checkbox" id="chkAutoSkip" checked>
      <span class="slider"></span>
    </label>
  </div>
  <div class="toggle-row">
    <span class="toggle-label">Anti-Tab Lock (Never pause on tab switch)</span>
    <label class="switch">
      <input type="checkbox" id="chkBypassLock" checked>
      <span class="slider"></span>
    </label>
  </div>
  <div class="toggle-row">
    <span class="toggle-label">Auto-Advance to next item</span>
    <label class="switch">
      <input type="checkbox" id="chkAutoNext" checked>
      <span class="slider"></span>
    </label>
  </div>
  <div class="toggle-row">
    <span class="toggle-label">Auto-Mute while fast-forwarding</span>
    <label class="switch">
      <input type="checkbox" id="chkAutoMute" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="status-box">
    Status: <span id="statusText" class="status-highlight">Scanning page for HTML5 / Video.js...</span>
  </div>

  <div class="shortcut-hint">
    Shortcuts: <b>Alt + V</b> (Skip) &bull; <b>Alt + S</b> (16x Speed) &bull; <b>Alt + N</b> (Next)
  </div>

  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    path: 'popup.js',
    name: 'popup.js',
    description: 'Popup script handling button clicks, storage synchronization, and active tab messaging',
    language: 'javascript',
    content: `document.addEventListener('DOMContentLoaded', () => {
  const btnSkipAll = document.getElementById('btnSkipAll');
  const btnSpeed16 = document.getElementById('btnSpeed16');
  const btnNext = document.getElementById('btnNext');
  const statusText = document.getElementById('statusText');
  const chkAutoSkip = document.getElementById('chkAutoSkip');
  const chkBypassLock = document.getElementById('chkBypassLock');
  const chkAutoNext = document.getElementById('chkAutoNext');
  const chkAutoMute = document.getElementById('chkAutoMute');

  // Load saved preferences
  chrome.storage.sync.get({
    autoSkipVideo: true,
    bypassTabLock: true,
    autoAdvanceNext: true,
    autoMute: true
  }, (items) => {
    chkAutoSkip.checked = items.autoSkipVideo;
    chkBypassLock.checked = items.bypassTabLock;
    chkAutoNext.checked = items.autoAdvanceNext;
    chkAutoMute.checked = items.autoMute;
  });

  // Save changes
  function save() {
    chrome.storage.sync.set({
      autoSkipVideo: chkAutoSkip.checked,
      bypassTabLock: chkBypassLock.checked,
      autoAdvanceNext: chkAutoNext.checked,
      autoMute: chkAutoMute.checked
    });
  }
  chkAutoSkip.addEventListener('change', save);
  chkBypassLock.addEventListener('change', save);
  chkAutoNext.addEventListener('change', save);
  chkAutoMute.addEventListener('change', save);

  // Check active tab status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].id) {
      statusText.textContent = 'No active tab detected';
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_PAGE_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statusText.textContent = 'Ready (Open your LMS or course page)';
        return;
      }
      if (response.videoCount > 0) {
        statusText.textContent = \`Found \${response.videoCount} video(s)\${response.hasVideoJs ? ' (Video.js detected)' : ''}\`;
      } else {
        statusText.textContent = 'No video detected on page yet';
      }
    });
  });

  btnSkipAll.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'SKIP_ALL_VIDEOS' }, () => {
          if (chrome.runtime.lastError) {
            statusText.textContent = 'Please refresh the course page';
            return;
          }
          statusText.textContent = '⚡ Videos completed!';
        });
      }
    });
  });

  btnSpeed16.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'SET_SPEED', speed: 16 }, () => {
          if (chrome.runtime.lastError) {
            statusText.textContent = 'Please refresh the course page';
            return;
          }
          statusText.textContent = '⏩ Playback set to 16x';
        });
      }
    });
  });

  btnNext.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'CLICK_NEXT' }, () => {
          if (chrome.runtime.lastError) {
            statusText.textContent = 'Please refresh the course page';
            return;
          }
          statusText.textContent = '⏭️ Advance triggered';
        });
      }
    });
  });
});`
  }
];

// Generates an unpacked Chrome Extension .zip file
export async function downloadExtensionZip(): Promise<void> {
  const zip = new JSZip();

  // Add root files
  for (const file of EXTENSION_FILES) {
    zip.file(file.path, file.content);
  }

  // Also add dist/ mirrors so if someone's manifest or folder references dist/scripts/content.js, it works 100%
  const contentFile = EXTENSION_FILES.find(f => f.path === 'content.js')?.content || '';
  const bgFile = EXTENSION_FILES.find(f => f.path === 'background.js')?.content || '';
  const cssFile = EXTENSION_FILES.find(f => f.path === 'content.css')?.content || '';
  const popupFile = EXTENSION_FILES.find(f => f.path === 'popup.html')?.content || '';
  const injectedFile = EXTENSION_FILES.find(f => f.path === 'injected.js')?.content || '';

  zip.file('dist/scripts/content.js', contentFile);
  zip.file('dist/scripts/background.js', bgFile);
  zip.file('dist/scripts/xyz.js', '// Utility helper\nconsole.log("active");');
  zip.file('dist/scripts/rdr.js', injectedFile);
  zip.file('dist/popup.html', popupFile);
  zip.file('dist/settings.html', popupFile);
  zip.file('dist/ui/content.css', cssFile);

  // Generate basic icon placeholders in SVG / DataURI or minimal 1x1 png bytes
  // A minimal valid 1x1 PNG transparent byte array
  const minimalPng = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
    0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120,
    156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68,
    174, 66, 96, 130
  ]);
  zip.file('icons/icon16.png', minimalPng);
  zip.file('icons/icon48.png', minimalPng);
  zip.file('icons/icon128.png', minimalPng);

  // Add README inside the ZIP
  zip.file('INSTALLATION_GUIDE.md', `# Installation Guide: Universal Course & Video Auto-Completer

1. Extract this ZIP folder to a convenient location on your computer.
2. Open Google Chrome, Brave, Microsoft Edge, or any Chromium browser.
3. In the URL address bar, navigate to: \`chrome://extensions/\`
4. Toggle on **"Developer mode"** in the top right corner.
5. Click the **"Load unpacked"** button in the top left.
6. Select the extracted folder containing \`manifest.json\`.
7. Done! The extension is now active on all websites (including your university LMS, Moodle, Coursera, Canvas, etc.).
8. Press **Alt+V** anytime to instantly complete videos, or click the extension icon.
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Universal-Course-Video-Completer-v3.7.0.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
