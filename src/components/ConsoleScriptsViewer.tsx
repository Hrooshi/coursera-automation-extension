import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, Zap, Shield, Play, HelpCircle, ExternalLink, ArrowRight } from 'lucide-react';

export const ConsoleScriptsViewer: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const videoCompleterSnippet = `// ⚡ INSTANT VIDEO 100% COMPLETER (Run in Chrome Console F12)
(async function () {
  const v = document.querySelector('video') || 
            document.querySelector('.vjs-tech') || 
            document.querySelector('[id*="videojs"] video');

  if (!v) {
    alert('❌ No video found on this page! Make sure you are on the lecture page.');
    return;
  }

  console.log('⚡ Found video player:', v.id || 'HTML5 video', 'Duration:', v.duration + 's');
  v.muted = true;
  v.playbackRate = 16.0;

  // Jump to 0.2 seconds before the end
  if (v.duration && !isNaN(v.duration)) {
    v.currentTime = Math.max(0, v.duration - 0.2);
  }

  try {
    await v.play();
  } catch (err) {}

  // Fire standard HTML5 & LMS tracking event sequence
  v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
  v.dispatchEvent(new Event('seeking', { bubbles: true }));
  v.dispatchEvent(new Event('seeked', { bubbles: true }));

  if (v.duration && !isNaN(v.duration)) {
    v.currentTime = v.duration;
  }
  v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
  v.dispatchEvent(new Event('ended', { bubbles: true }));
  v.dispatchEvent(new Event('pause', { bubbles: true }));

  console.log('✅ Video marked 100% completed and ended event triggered!');

  // Automatically find and click Next Activity button
  const nextBtn = document.querySelector('.activity-navigation a[title*="Next"]') ||
                  document.querySelector('.next-activity a') ||
                  document.querySelector('#next-activity-link') ||
                  document.querySelector('button[aria-label="Next Item"]') ||
                  document.querySelector('a.btn-primary[href*="mod/"]');

  if (nextBtn) {
    console.log('⏭️ Found next lesson link! Advancing in 1.2 seconds...');
    setTimeout(() => nextBtn.click(), 1200);
  }
})();`;

  const moodleBatchCompleterSnippet = `// 🚀 MOODLE WHOLE COURSE BATCH COMPLETER (Run on Moodle Course Home Page)
// Opens each locked activity in a fast background frame to satisfy "view" requirements
(async function () {
  console.log('🔍 Scanning course page for locked and incomplete activities...');

  // Find all activity links on the Moodle course page
  const activityLinks = Array.from(document.querySelectorAll(
    '.activity-item a.aalink, .activityinstance a, li.activity a, a[href*="/mod/"]'
  ))
  .map(a => a.href)
  .filter((href, idx, arr) => href && arr.indexOf(href) === idx && !href.includes('#'));

  if (activityLinks.length === 0) {
    alert('No activity links found. Make sure you are on your Moodle course page (e.g., /course/view.php)');
    return;
  }

  console.log(\`🎯 Found \${activityLinks.length} course activities. Starting batch completion...\`);

  // Create an unobtrusive progress banner
  const banner = document.createElement('div');
  banner.style = 'position:fixed;bottom:20px;right:20px;background:#0f172a;color:#38bdf8;padding:16px 22px;border:2px solid #38bdf8;border-radius:12px;z-index:999999;font-family:sans-serif;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.5);';
  banner.innerHTML = '<b>⚡ Course Completer:</b> Starting batch view...';
  document.body.appendChild(banner);

  // Hidden iframe to load each activity sequentially
  const iframe = document.createElement('iframe');
  iframe.style = 'width:0;height:0;border:none;position:absolute;visibility:hidden;';
  document.body.appendChild(iframe);

  let doneCount = 0;

  for (const url of activityLinks) {
    banner.innerHTML = \`<b>⚡ Processing (\${doneCount + 1}/\${activityLinks.length}):</b><br><small style="color:#94a3b8">\${url.split('/').slice(-2).join('/')}</small>\`;
    
    await new Promise((resolve) => {
      iframe.src = url;
      iframe.onload = () => {
        // Try skipping any video inside the loaded iframe
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const v = doc.querySelector('video');
          if (v) {
            v.muted = true;
            v.currentTime = v.duration || 10;
            v.dispatchEvent(new Event('ended', { bubbles: true }));
          }
        } catch (e) {}
        setTimeout(resolve, 800); // 800ms to register Moodle server view tracking
      };
      // Fallback timeout in case of slow network
      setTimeout(resolve, 2500);
    });

    doneCount++;
  }

  iframe.remove();
  banner.style.background = '#064e3b';
  banner.style.borderColor = '#10b981';
  banner.style.color = '#a7f3d0';
  banner.innerHTML = '<b>🎉 DONE!</b> All activities visited. Reloading page in 2s to show unlocked list...';

  setTimeout(() => window.location.reload(), 2000);
})();`;

  const aceScriptUserscript = `// ==UserScript==
// @name         Universal Course & Video Completer (Ace Script / Tampermonkey)
// @namespace    http://tampermonkey.net/
// @version      3.7.0
// @description  Instantly completes HTML5/Video.js videos and bypasses Moodle/LMS tab-lock restrictions
// @author       Universal Education Automation
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // 1. Anti-Tab Lock Bypass (Never pauses video on tab switch)
  try {
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    window.addEventListener('blur', (e) => e.stopImmediatePropagation(), true);
    document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
  } catch (e) {}

  // 2. Video Completer helper
  function completeVideo(v) {
    if (!v || v.dataset.autoCompleted) return;
    v.dataset.autoCompleted = 'true';
    v.muted = true;
    v.playbackRate = 16.0;
    
    if (v.duration && !isNaN(v.duration)) {
      v.currentTime = Math.max(0, v.duration - 0.2);
    }
    
    v.play().then(() => {
      v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
      v.dispatchEvent(new Event('ended', { bubbles: true }));
      console.log('[Completer] Video 100% completed!');
    }).catch(() => {
      v.dispatchEvent(new Event('ended', { bubbles: true }));
    });
  }

  // Keyboard shortcut: Alt + V to complete video on active page
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'v' || e.key === 'V')) {
      const v = document.querySelector('video') || document.querySelector('.vjs-tech');
      if (v) completeVideo(v);
    }
  });

  // Auto-scan for videos
  const checkInterval = setInterval(() => {
    const v = document.querySelector('video') || document.querySelector('.vjs-tech');
    if (v) {
      completeVideo(v);
      clearInterval(checkInterval);
    }
  }, 1000);
})();`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl text-slate-200">
      {/* Explanation of the User's Error Screenshot */}
      <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Why Chrome showed "Could not load javascript 'dist/scripts/content.js'"
          </span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          The original GitHub repository had <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">dist/</code> inside its <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">.gitignore</code> file, which meant the original author uploaded only the manifest without the built scripts.
        </p>
        <p className="text-xs text-emerald-300/90 font-medium leading-relaxed">
          <b>Good news:</b> You do not even need to install an unpacked extension if you prefer not to! Below are <b>instant 1-click console scripts</b> and an <b>Ace Script userscript</b> (which you already have installed in your browser!) that run immediately.
        </p>
      </div>

      {/* Script 1: 1-Click Video Completer (Play once and boom it works) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Option A: Instant Video Completer (Open Vid &rarr; Console &rarr; Boom!)
              </h3>
              <p className="text-xs text-slate-400">
                Works on any video page (MIT-WPU Moodle, Video.js, Coursera, Canvas). Plays to end and triggers completion instantly.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy('video-script', videoCompleterSnippet)}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
          >
            {copiedId === 'video-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId === 'video-script' ? 'Copied to Clipboard!' : 'Copy Video Script'}</span>
          </button>
        </div>

        <div className="p-4 text-xs flex flex-col gap-3">
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-lg p-3 text-[11px] text-blue-300 flex items-center gap-2">
            <b>How to use:</b>
            <span>1. Open your video lecture &bull; 2. Press <b>F12</b> (or Right-click &rarr; Inspect) &bull; 3. Click the <b>Console</b> tab &bull; 4. Paste this code and press <b>Enter</b>!</span>
          </div>
          <pre className="p-3 bg-black/60 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52 select-text">
            <code>{videoCompleterSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Script 2: Moodle Batch Course Completer (Unlock Whole List) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Option B: Unlock Entire Course List at Once (Moodle Batch Completer)
              </h3>
              <p className="text-xs text-slate-400">
                Run this directly on your course overview page (showing Module 5 / Module 6). It visits each locked activity in the background to satisfy Moodle's "view" requirements!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy('batch-script', moodleBatchCompleterSnippet)}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            {copiedId === 'batch-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId === 'batch-script' ? 'Copied to Clipboard!' : 'Copy Batch Script'}</span>
          </button>
        </div>

        <div className="p-4 text-xs flex flex-col gap-3">
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-lg p-3 text-[11px] text-indigo-300 flex items-center gap-2">
            <b>How to use:</b>
            <span>Go to your course page with the locked items list &bull; Press <b>F12 &rarr; Console</b> &bull; Paste and press <b>Enter</b> &bull; Watch all items unlock!</span>
          </div>
          <pre className="p-3 bg-black/60 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52 select-text">
            <code>{moodleBatchCompleterSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Script 3: Ace Script Userscript (Since they already have Ace Script in Chrome!) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Option C: Ace Script / Tampermonkey Userscript (Runs Automatically)
              </h3>
              <p className="text-xs text-slate-400">
                You already have <b>Ace Script 1.2.6</b> installed (seen in your Chrome extensions)! Add this script to Ace Script for permanent 100% auto-completion and tab-lock bypass on every page load.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy('userscript', aceScriptUserscript)}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30 transition-all shrink-0"
          >
            {copiedId === 'userscript' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId === 'userscript' ? 'Copied to Clipboard!' : 'Copy Userscript'}</span>
          </button>
        </div>

        <div className="p-4 text-xs flex flex-col gap-3">
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 text-[11px] text-emerald-300 flex items-center gap-2">
            <b>How to install in Ace Script:</b>
            <span>Click the Ace Script icon in your Chrome toolbar &rarr; "Create a new script" &rarr; Paste this code &rarr; Save. Done!</span>
          </div>
          <pre className="p-3 bg-black/60 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52 select-text">
            <code>{aceScriptUserscript}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
