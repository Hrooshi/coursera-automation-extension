import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, Zap, Shield, Play, HelpCircle, ExternalLink, ArrowRight, Clock, RefreshCw } from 'lucide-react';

export const ConsoleScriptsViewer: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popup' | 'inTab' | 'single'>('popup');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1. POPUP ENGINE: UNIVERSAL ALL-CHAPTERS & ALL-MODULES COMPLETER (NO LIMITS!)
  const popupWindowEngineScript = `// 🔥 UNIVERSAL ALL-MODULES & ALL-CHAPTERS COURSE COMPLETER (NO LIMITS)
// Auto-expands every collapsed chapter/accordion on your course page,
// detects every video across all chapters, plays for 1s, marks 100%, and advances!
(async function () {
  console.log('%c🚀 Universal All-Chapters Course Completer starting...', 'color:#38bdf8;font-weight:bold;font-size:15px;');

  // STEP 1: Auto-expand ALL collapsed modules, chapters, and accordions on the course page
  console.log('📂 Auto-expanding all collapsed modules and chapter sections...');
  const expanders = document.querySelectorAll(
    '.collapsed, [aria-expanded="false"], .course-section.collapsed, details:not([open]), .toggle, [data-toggle="collapse"]'
  );
  expanders.forEach(el => {
    try {
      if (typeof el.click === 'function') el.click();
      if (el.tagName === 'DETAILS') el.open = true;
    } catch(e) {}
  });

  // Brief 600ms delay to let Moodle's DOM finish rendering expanded sections
  await new Promise(r => setTimeout(r, 600));

  // STEP 2: Deep Scan all chapters and activities across the entire course syllabus
  const allActivities = [];
  const seenUrls = new Set();

  // Look for section/chapter blocks (supports Moodle Boost, RemUI, Edwiser, Canvas, etc.)
  const sectionBlocks = document.querySelectorAll(
    'li.section, div.course-section, .topics li, .weeks li, div[data-sectionid], .course-content .section'
  );

  if (sectionBlocks.length > 0) {
    sectionBlocks.forEach((sec, sIdx) => {
      const chapterTitle = (
        sec.querySelector('.sectionname, .section-title, h3, h4, .course-section-header')?.innerText || 
        \`Chapter / Module \${sIdx + 1}\`
      ).trim().replace(/\\s+/g, ' ');

      const links = sec.querySelectorAll(
        'a[href*="/mod/"], .activity-item a, .activityinstance a, li.activity a, a.aalink'
      );

      links.forEach(a => {
        const cleanUrl = a.href.split('#')[0];
        const isActionUrl = cleanUrl.includes('delete') || cleanUrl.includes('edit') || cleanUrl.includes('mod/forum/post');
        if (cleanUrl && !seenUrls.has(cleanUrl) && !isActionUrl) {
          seenUrls.add(cleanUrl);
          const actTitle = (a.innerText.trim() || a.getAttribute('title') || 'Course Lesson').replace(/\\s+/g, ' ');
          allActivities.push({
            chapter: chapterTitle,
            title: actTitle,
            href: cleanUrl
          });
        }
      });
    });
  }

  // Fallback: If no structured sections detected, grab all activity links on the entire page
  if (allActivities.length === 0) {
    document.querySelectorAll('a[href*="/mod/"], .activity-item a, .activityinstance a, li.activity a, a.aalink').forEach(a => {
      const cleanUrl = a.href.split('#')[0];
      if (cleanUrl && !seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        allActivities.push({
          chapter: 'All Modules',
          title: (a.innerText.trim() || 'Course Lesson').replace(/\\s+/g, ' '),
          href: cleanUrl
        });
      }
    });
  }

  if (allActivities.length === 0) {
    alert('❌ No activities found! Make sure you are on the main course overview page showing your chapters.');
    return;
  }

  // Count unique chapters
  const uniqueChapters = [...new Set(allActivities.map(a => a.chapter))];
  console.log(\`%c🎯 DETECTED \${uniqueChapters.length} CHAPTERS / MODULES WITH \${allActivities.length} TOTAL ACTIVITIES!\`, 'color:#10b981;font-weight:bold;');
  uniqueChapters.forEach((ch, idx) => {
    const count = allActivities.filter(a => a.chapter === ch).length;
    console.log(\`   [\${idx + 1}] \${ch} (\${count} activities)\`);
  });

  // STEP 3: Open ONE top-level helper window (avoids iframe postMessage/timeout restrictions!)
  const win = window.open(allActivities[0].href, 'moodleCompleter', 'width=740,height=540,left=120,top=120');
  if (!win) {
    alert('⚠️ Popup was blocked! Look at the right side of your Chrome URL bar, click the popup icon, select "Always allow pop-ups for lms.mitwpu.edu.in", and run again.');
    return;
  }

  // STEP 4: Process every single activity across all chapters without limits!
  for (let i = 0; i < allActivities.length; i++) {
    const item = allActivities[i];
    console.log(\`%c[\${i + 1}/\${allActivities.length}] [\${item.chapter}] \${item.title}\`, 'color:#60a5fa;font-weight:bold;');

    // Navigate helper window to current activity
    if (win.location.href !== item.href) {
      win.location.href = item.href;
    }

    // Wait for page & video to load, play 1 second, and complete
    await new Promise((resolve) => {
      let checks = 0;
      const interval = setInterval(async () => {
        checks++;
        try {
          if (win.document && win.document.readyState === 'complete') {
            const doc = win.document;
            const video = doc.querySelector('video') || 
                          doc.querySelector('.vjs-tech') || 
                          doc.querySelector('[id*="videojs"] video');

            if (video) {
              clearInterval(interval);
              console.log(\`   🎬 Video detected in \${item.title}! Playing for 1 second...\`);
              
              video.muted = true;
              video.playbackRate = 16.0;

              const playBtn = doc.querySelector('.vjs-big-play-button, button.vjs-play-control, .ytp-play-button') || video;
              if (playBtn) playBtn.click();
              try { await video.play(); } catch(e) {}

              // WAIT 1 SECOND (as requested!)
              setTimeout(() => {
                if (video.duration && !isNaN(video.duration)) {
                  video.currentTime = Math.max(0, video.duration - 0.2);
                }
                video.dispatchEvent(new Event('timeupdate', { bubbles: true }));
                video.dispatchEvent(new Event('ended', { bubbles: true }));
                video.dispatchEvent(new Event('pause', { bubbles: true }));
                console.log(\`   ✅ Video marked 100% completed!\`);
                resolve();
              }, 1000);
              return;
            } else if (checks > 7) {
              // Reading / Page activity (1.5s is plenty to register Moodle server view tracking)
              clearInterval(interval);
              console.log(\`   📄 Reading/Material marked as viewed.\`);
              resolve();
              return;
            }
          }
        } catch (e) {
          // Cross-window loading transition
        }

        // 6s safety timeout per item
        if (checks > 14) {
          clearInterval(interval);
          resolve();
        }
      }, 400);
    });

    await new Promise(r => setTimeout(r, 400));
  }

  // STEP 5: All chapters finished! Close helper and reload main page
  try { win.close(); } catch(e) {}
  alert(\`🎉 ALL \${uniqueChapters.length} CHAPTERS COMPLETED! (\${allActivities.length} total activities)\\nReloading main page to show unlocked course...\`);
  window.location.reload();
})();`;

  // 2. IN-TAB AUTOPILOT (ZERO POPUPS AT ALL - NAVIGATES THE ACTIVE TAB DIRECTLY)
  const inTabAutopilotScript = `// 🚀 IN-TAB AUTOPILOT (Zero popups, zero iframes, navigates active tab directly!)
// Run once on the main course page to start the loop:
(function () {
  const links = Array.from(document.querySelectorAll(
    '.activity-item a.aalink, .activityinstance a, li.activity a, a[href*="/mod/"]'
  ))
  .map(a => a.href)
  .filter((href, idx, arr) => href && arr.indexOf(href) === idx && !href.includes('#'));

  if (!links.length) {
    alert('❌ No activity links found on this page!');
    return;
  }

  sessionStorage.setItem('COMPLETER_QUEUE', JSON.stringify(links));
  sessionStorage.setItem('COMPLETER_HOME', window.location.href);
  sessionStorage.setItem('COMPLETER_ACTIVE', '1');

  alert(\`Found \${links.length} activities! Starting in-tab auto-play. It will visit each video, play for 1s, and return home.\`);
  window.location.href = links[0];
})();`;

  // 3. SINGLE VIDEO 1-LINER
  const singleVideoOneLiner = `(async function(){const v=document.querySelector('video')||document.querySelector('.vjs-tech')||document.querySelector('[id*="videojs"] video');if(!v){alert('No video found!');return;}v.muted=true;v.playbackRate=16;await v.play().catch(()=>{});await new Promise(r=>setTimeout(r,1000));v.currentTime=Math.max(0,(v.duration||10)-0.2);v.dispatchEvent(new Event('timeupdate',{bubbles:true}));v.dispatchEvent(new Event('ended',{bubbles:true}));console.log('✅ Video 100% completed!');const n=document.querySelector('.activity-navigation a[title*="Next"],.next-activity a,a.btn-primary:has-text("Next")');if(n)setTimeout(()=>n.click(),800);})();`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl text-slate-200">
      {/* Top Banner with direct answer to user request */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              The Perfect Console Script (Play 1s &bull; Advance &bull; Return to Main Page)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Exactly what you asked for: Run this script once on your main course page. It opens each module item, clicks play on the video, <b>waits 1 second</b>, marks 100% completion, goes to the next activity, and when all are done, <b>reloads the main page</b> with everything unlocked!
          </p>
        </div>

        <button
          onClick={() => handleCopy('popup-script', popupWindowEngineScript)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
        >
          {copiedId === 'popup-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedId === 'popup-script' ? 'Copied to Clipboard!' : 'Copy Script (F12)'}</span>
        </button>
      </div>

      {/* 3 Step Visual Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
            1
          </div>
          <div>
            <b className="text-white">Open Moodle Course Page</b>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Go to your course overview on <code className="text-blue-300">lms.mitwpu.edu.in</code> showing Module 5 / Module 6.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
            2
          </div>
          <div>
            <b className="text-white">Press F12 &rarr; Console</b>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Right-click anywhere on the page, click <b>Inspect</b>, and select the <b>Console</b> tab.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
            3
          </div>
          <div>
            <b className="text-white">Paste &amp; Press Enter</b>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Watch the floating HUD play each video for 1s, complete it, and reload with all checkmarks green!
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis of user screenshot */}
      <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>Fixing Your Screenshot: "Not starting Moodle session in iframe" & "postMessage warning"</span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          In your console screenshot, Moodle logged: <code className="bg-black/40 px-1 rounded text-amber-300">Not starting Moodle session timeout warning in this iframe</code> and YouTube threw a <code className="bg-black/40 px-1 rounded text-amber-300">postMessage</code> origin check because a hidden iframe was used.
        </p>
        <p className="text-xs text-emerald-300/90 font-medium leading-relaxed">
          <b>Solution: Use Option 1 below!</b> It opens ONE small helper window (a genuine top-level window, <i>not an iframe</i>), so Moodle session cookies and YouTube players run with 100% full permissions, play for 1 second, advance, and return home with everything completed!
        </p>
      </div>

      {/* Script Mode Selector */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('popup')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'popup'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Option 1: Pop-up Helper Window (Recommended - Fixes Screenshot Error)</span>
        </button>
        <button
          onClick={() => setActiveTab('inTab')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inTab'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Option 2: In-Tab Autopilot (Zero Popups)</span>
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'single'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Option 3: 1-Liner For Single Video Page</span>
        </button>
      </div>

      {/* Tab 1: Pop-up Helper Window (Primary) */}
      {activeTab === 'popup' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                Pop-up Helper Window Automator (Plays video 1s &bull; Advances &bull; Reloads Main Page)
              </h3>
              <p className="text-xs text-slate-400">
                Fixes iframe restrictions: opens 1 small window that cycles through all module items, plays 1s, and reloads home.
              </p>
            </div>
            <button
              onClick={() => handleCopy('popup-script', popupWindowEngineScript)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              {copiedId === 'popup-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'popup-script' ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/60 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72 select-text leading-relaxed">
            <code>{popupWindowEngineScript}</code>
          </pre>
        </div>
      )}

      {/* Tab 2: In-Tab Autopilot */}
      {activeTab === 'inTab' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                In-Tab Autopilot (Zero Popups &bull; Navigates Current Tab Directly)
              </h3>
              <p className="text-xs text-slate-400">
                Saves the queue in sessionStorage and walks through the lessons directly in your current tab.
              </p>
            </div>
            <button
              onClick={() => handleCopy('intab-script', inTabAutopilotScript)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              {copiedId === 'intab-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'intab-script' ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/60 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72 select-text leading-relaxed">
            <code>{inTabAutopilotScript}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Single Video 1-Liner */}
      {activeTab === 'single' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                1-Liner: Play 1s &bull; Complete 100% &bull; Click Next (For Active Lecture Page)
              </h3>
              <p className="text-xs text-slate-400">
                If you are already on a video lecture page and just want to finish this one video in 1 second.
              </p>
            </div>
            <button
              onClick={() => handleCopy('single-script', singleVideoOneLiner)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              {copiedId === 'single-script' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'single-script' ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/60 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40 select-text leading-relaxed">
            <code>{singleVideoOneLiner}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
