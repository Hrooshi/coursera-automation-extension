import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, Zap, Shield, Play, HelpCircle, ExternalLink, ArrowRight, Clock, RefreshCw, Code2, CheckCircle2, Filter } from 'lucide-react';

export const ConsoleScriptsViewer: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popup' | 'userscript' | 'inTab' | 'single'>('popup');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1. POPUP ENGINE: AUTO-RELOADS AFTER EACH CHAPTER, DETECTS ALL MODULES, SKIPS "DONE" COMPLETED VIDEOS!
  // Note: Standard single and double quotes only (zero unescaped backtick bugs).
  const popupWindowEngineScript = `// 🔥 UNIVERSAL ALL-MODULES & ALL-CHAPTERS COURSE COMPLETER
// Features:
// 1. Full Module Detection across your course overview & sidebar syllabus
// 2. Skips completed videos that have 'done' / checkmarks / green badges
// 3. Auto-expands every collapsed accordion & section
// 4. Plays unfinished videos for 3.5s at 16x speed, marks 100% complete
// 5. Reloads page once a chapter is done to unlock next chapters (1.4, 1.5...)
// 6. Detects newly unlocked chapters and advances seamlessly!
(async function () {
  var VIDEO_PLAY_SECONDS = 3.5;

  console.log('%c🚀 Course Completer (Module Detection + Skip "Done" Videos) Started...', 'color:#38bdf8;font-weight:bold;font-size:15px;');
  console.log('⏱️ Playback Duration: ' + VIDEO_PLAY_SECONDS + 's per pending video. Completed videos ("Done") will be skipped.');

  // Helper functions to normalize URLs and IDs
  var cleanUrl = function (raw) {
    if (!raw) return '';
    try {
      var u = new URL(raw, window.location.href);
      u.hash = '';
      return u.href;
    } catch(e) {
      return (raw || '').split('#')[0];
    }
  };

  var extractChapId = function (url) {
    try {
      var u = new URL(url, window.location.href);
      return u.searchParams.get('chapterid');
    } catch(e) {
      var m = (url || '').match(/[?&]chapterid=(\\d+)/);
      return m ? m[1] : null;
    }
  };

  var extractModuleId = function (url) {
    try {
      var u = new URL(url, window.location.href);
      return u.searchParams.get('id');
    } catch(e) {
      var m = (url || '').match(/[?&]id=(\\d+)/);
      return m ? m[1] : null;
    }
  };

  // Helper: check if a video or activity element already has a "Done" completion badge
  var isElementAlreadyDone = function (el) {
    if (!el) return false;
    var container = el.closest('.activity-item, .activity, .modtype_videotime, .modtype_book, li, .card, .section, tr') || el.parentElement;
    if (!container) return false;

    // Check text badges like 'Done', 'Completed', 'Done: View'
    var textNodes = container.querySelectorAll('.badge, [data-region="completion-info"], .completion-info, .autocompletion, .custom-completion-conditions, .automatic-completion-conditions, button');
    for (var b = 0; b < textNodes.length; b++) {
      var t = (textNodes[b].innerText || textNodes[b].textContent || '').toLowerCase().trim();
      if (t.includes('done') || t.includes('completed') || t.includes('complete')) {
        return true;
      }
    }

    // Check SVG / icon checkmarks
    var checkIcons = container.querySelectorAll('.fa-check, .fa-check-circle, .icon.fa-check, svg.text-success, .text-success, [aria-label*="Done" i], [aria-label*="Completed" i], [title*="Done" i]');
    if (checkIcons.length > 0) return true;

    // Check Moodle completion form/checkbox state
    var completeInputs = container.querySelectorAll('input[name*="completion"][value="1"], button[data-action="toggle-manual-completion"][aria-checked="true"]');
    if (completeInputs.length > 0) return true;

    return false;
  };

  // Visited trackers to prevent loops
  var completedUrls = new Set();
  var completedChapterIds = new Set();
  var completedModuleIds = new Set();

  // Helper: wait for window ready state
  var waitWin = async function (w, maxSec) {
    if (!maxSec) maxSec = 14;
    return new Promise(function (resolve) {
      var passed = 0;
      var t = setInterval(function () {
        passed += 0.25;
        try {
          if (w.document && (w.document.readyState === 'complete' || w.document.readyState === 'interactive')) {
            clearInterval(t);
            resolve(true);
            return;
          }
        } catch(e) {}
        if (passed >= maxSec) {
          clearInterval(t);
          resolve(false);
        }
      }, 250);
    });
  };

  // Helper: process video on target window, skipping any marked 'Done'
  var playVideosOnWin = async function (w) {
    try {
      var doc = w.document;
      if (!doc) return;

      // Check page-level completion status first
      var pageBadges = doc.querySelectorAll('.badge, [data-region="completion-info"], .completion-info, .automatic-completion-conditions');
      for (var p = 0; p < pageBadges.length; p++) {
        var pText = (pageBadges[p].innerText || '').toLowerCase().trim();
        if (pText.includes('done') || pText.includes('completed')) {
          console.log('%c   ⏭️ Page badge indicates "Done" - skipping video playback on this page!', 'color:#a3e635;font-weight:bold;');
          return;
        }
      }

      var videos = Array.from(doc.querySelectorAll('video, .vjs-tech, [id*="videojs"] video'));
      if (videos.length > 0) {
        console.log('   🎬 Found ' + videos.length + ' video(s) on page! Checking completion...');
        for (var i = 0; i < videos.length; i++) {
          var v = videos[i];

          // Check if this specific video is already marked Done
          if (isElementAlreadyDone(v)) {
            console.log('   ⏭️ Video ' + (i + 1) + '/' + videos.length + ' is marked "Done"! Skipping...');
            continue;
          }

          console.log('   ▶️ Playing Video ' + (i + 1) + '/' + videos.length + ' for ' + VIDEO_PLAY_SECONDS + 's at 16x...');
          v.muted = true;
          v.playbackRate = 16.0;
          var btn = v.parentElement ? v.parentElement.querySelector('.vjs-big-play-button, button.vjs-play-control, .ytp-play-button') : null;
          if (!btn) btn = v;
          if (btn && typeof btn.click === 'function') {
            try { btn.click(); } catch(e) {}
          }
          try { await v.play(); } catch(e) {}
          await new Promise(function (r) { setTimeout(r, VIDEO_PLAY_SECONDS * 1000); });
          if (v.duration && !isNaN(v.duration)) {
            v.currentTime = Math.max(0, v.duration - 0.2);
          }
          v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
          v.dispatchEvent(new Event('ended', { bubbles: true }));
          v.dispatchEvent(new Event('pause', { bubbles: true }));
          console.log('   ✅ Video ' + (i + 1) + '/' + videos.length + ' finished 100%!');
          await new Promise(function (r) { setTimeout(r, 400); });
        }
      } else {
        console.log('   📄 Viewing material / content page...');
        await new Promise(function (r) { setTimeout(r, 800); });
      }
    } catch(err) {
      console.warn('Playback warning:', err);
    }
  };

  // STEP 1: MODULE DETECTION - Auto-expand all modules & chapters across course
  console.log('📂 [Module Detection] Scanning course page and auto-expanding all module sections...');
  var expandableSections = document.querySelectorAll(
    '.collapsed, [aria-expanded="false"], .course-section.collapsed, details:not([open]), .collapsible-actions [data-action="expandall"]'
  );
  expandableSections.forEach(function (el) {
    try {
      if (typeof el.click === 'function') el.click();
      if (el.tagName === 'DETAILS') el.open = true;
    } catch(e) {}
  });
  await new Promise(function (r) { setTimeout(r, 600); });

  // STEP 2: Collect all module activity links, skipping any that are already marked 'Done'
  var allFoundLinks = Array.from(document.querySelectorAll(
    'a[href*="/mod/"], .activity-item a, .activityinstance a, li.activity a, a.aalink'
  ));

  console.log('🔍 [Module Detection] Identified ' + allFoundLinks.length + ' raw activity links in course syllabus.');

  var startLinks = [];
  var skippedDoneCount = 0;

  for (var k = 0; k < allFoundLinks.length; k++) {
    var aTag = allFoundLinks[k];
    var cUrl = cleanUrl(aTag.href);
    if (!cUrl || cUrl.includes('delete') || cUrl.includes('edit') || cUrl.includes('/forum/post')) continue;

    // Skip duplicates
    if (startLinks.indexOf(cUrl) !== -1) continue;

    // Check if syllabus already says 'Done'
    if (isElementAlreadyDone(aTag)) {
      skippedDoneCount++;
      completedUrls.add(cUrl);
      var mIdDone = extractModuleId(cUrl);
      if (mIdDone) completedModuleIds.add(mIdDone);
      continue;
    }

    startLinks.push(cUrl);
  }

  console.log('⚡ [Detection Summary] Found ' + startLinks.length + ' pending activities to complete! (Skipped ' + skippedDoneCount + ' already "Done")');

  if (!startLinks.length) {
    alert('🎉 All detected course modules and activities are already "Done"! Nothing left to play.');
    return;
  }

  var firstUrl = startLinks[0];
  console.log('🌐 Opening Helper Window with first pending module: ' + firstUrl);
  var win = window.open(firstUrl, 'moodleCompleter', 'width=780,height=580,left=120,top=120');
  if (!win) {
    alert('⚠️ Popup blocked! Click the popup icon in your Chrome URL bar, select "Always allow popups for lms.mitwpu.edu.in", then run again.');
    return;
  }

  await waitWin(win);
  await new Promise(function (r) { setTimeout(r, 1000); });

  var keepRunning = true;
  var cycle = 0;

  while (keepRunning) {
    cycle++;
    var curUrl = cleanUrl(win.location.href);
    var curChapId = extractChapId(curUrl);
    var curModId = extractModuleId(curUrl);

    completedUrls.add(curUrl);
    if (curChapId) completedChapterIds.add(curChapId);

    var pageTitle = win.document && win.document.title ? win.document.title : ('Activity #' + cycle);
    console.log('\\n%c▶️ [Step ' + cycle + '] Active Page: ' + pageTitle.substring(0, 48), 'color:#38bdf8;font-weight:bold;');

    // 1. Play & complete videos on current page (skips if 'Done')
    await playVideosOnWin(win);

    // 2. Reload the page once chapter is done so Moodle registers completion & unlocks 1.4!
    console.log('🔄 [Reload Check] Reloading page to register completion with Moodle and reveal newly unlocked chapters (e.g. 1.4)...');
    win.location.reload();
    await waitWin(win);
    await new Promise(function (r) { setTimeout(r, 1200); });

    // 3. Scan the freshly reloaded DOM for the next available chapter or module
    var nextUrl = null;
    var nextLabel = '';

    // A) In Book: Check "Next chapter" arrow navigation
    var nextChapBtn = win.document ? win.document.querySelector(
      '.nav-next a, a.nav-next, .arrow_link.next, a[title*="Next chapter"], a[aria-label*="Next chapter"], .book-next a, [data-action="next-chapter"]'
    ) : null;
    if (nextChapBtn && nextChapBtn.href) {
      var candUrl = cleanUrl(nextChapBtn.href);
      var candChapId = extractChapId(candUrl);
      if ((candChapId && !completedChapterIds.has(candChapId)) || (!completedUrls.has(candUrl))) {
        nextUrl = candUrl;
        nextLabel = nextChapBtn.innerText ? nextChapBtn.innerText.trim() : 'Next Chapter (Arrow Navigation)';
      }
    }

    // B) In Book: Scan Table of Contents for newly unlocked / available sub-chapters (1.4, 1.5...)
    if (!nextUrl && win.document) {
      var tocLinks = Array.from(win.document.querySelectorAll(
        '.book_toc a, .block_book_toc a, .book-toc a, nav.toc a, a[href*="chapterid="], [aria-label*="Table of contents"] a'
      ));

      for (var tIdx = 0; tIdx < tocLinks.length; tIdx++) {
        var a = tocLinks[tIdx];
        var raw = cleanUrl(a.href);
        var cId = extractChapId(raw);
        var isRestricted = a.closest('.dimmed_text, .restricted, .dimmed, .locked') || (a.parentElement && a.parentElement.querySelector('.lock, .fa-lock'));
        if (!isRestricted) {
          if ((cId && !completedChapterIds.has(cId)) || (!completedUrls.has(raw))) {
            nextUrl = raw;
            nextLabel = a.innerText ? a.innerText.trim() : ('Chapter ' + (cId || 'Sub-chapter'));
            break;
          }
        }
      }
    }

    // C) If Book is completely finished: Mark module ID as completed so we NEVER loop back to 1.1!
    if (!nextUrl) {
      if (curModId) completedModuleIds.add(curModId);
      console.log('📘 Current Book/Module finished! Checking for Next Activity / Next Module...');

      // Safe check for "Next activity" button (valid CSS selectors, avoiding invalid pseudo-classes)
      if (win.document) {
        var nextActSelectors = [
          '.activity-navigation .next-activity a',
          '.activity-navigation a[title*="Next"]',
          '.activity-navigation a[aria-label*="Next"]',
          '#next-activity-link',
          '.nav-next a',
          '.next_activity a'
        ];
        var candAct = win.document.querySelector(nextActSelectors.join(', '));
        if (!candAct) {
          // Fallback: search all buttons and links whose text says Next or Next activity
          var allLinksOnPage = Array.from(win.document.querySelectorAll('a.btn, a.btn-primary, .activity-navigation a'));
          for (var al = 0; al < allLinksOnPage.length; al++) {
            var txt = (allLinksOnPage[al].innerText || '').toLowerCase();
            if (txt.includes('next') && allLinksOnPage[al].href) {
              candAct = allLinksOnPage[al];
              break;
            }
          }
        }

        if (candAct && candAct.href) {
          var candUrl2 = cleanUrl(candAct.href);
          var candModId = extractModuleId(candUrl2);
          if ((candModId && !completedModuleIds.has(candModId)) || (!completedUrls.has(candUrl2))) {
            nextUrl = candUrl2;
            nextLabel = candAct.innerText ? candAct.innerText.trim() : 'Next Course Activity';
          }
        }
      }
    }

    // D) Fallback Module Detection: Fetch refreshed course syllabus to detect newly unlocked modules!
    if (!nextUrl) {
      console.log('🌐 [Module Detection] Fetching refreshed course syllabus to detect newly unlocked modules...');
      try {
        var resp = await fetch(window.location.href, { credentials: 'same-origin' });
        var html = await resp.text();
        var syllabusDoc = new DOMParser().parseFromString(html, 'text/html');
        var allSyllabusLinks = Array.from(syllabusDoc.querySelectorAll(
          'a[href*="/mod/"], .activity-item a, .activityinstance a, li.activity a, a.aalink'
        ));

        for (var sIdx = 0; sIdx < allSyllabusLinks.length; sIdx++) {
          var aSyl = allSyllabusLinks[sIdx];
          var rawSyl = cleanUrl(aSyl.href);
          var mId = extractModuleId(rawSyl);
          if (!rawSyl || rawSyl.includes('delete') || rawSyl.includes('edit')) continue;
          if (completedUrls.has(rawSyl) || (mId && completedModuleIds.has(mId))) continue;

          // Skip if already marked Done in syllabus
          if (isElementAlreadyDone(aSyl)) {
            completedUrls.add(rawSyl);
            if (mId) completedModuleIds.add(mId);
            continue;
          }

          var isLockedSyl = aSyl.closest('.dimmed_text, .restricted, .dimmed, .locked') || (aSyl.parentElement && aSyl.parentElement.querySelector('.lock, .fa-lock'));
          if (!isLockedSyl) {
            nextUrl = rawSyl;
            nextLabel = aSyl.innerText ? aSyl.innerText.trim() : 'Next Module';
            break;
          }
        }
      } catch(e) {
        console.warn('Syllabus fetch warning:', e);
      }
    }

    // 4. Navigate or Finish
    if (nextUrl) {
      console.log('%c🎯 [NEXT DETECTED AFTER RELOAD] Moving to: "' + nextLabel + '" (' + nextUrl + ')', 'color:#10b981;font-weight:bold;');
      win.location.href = nextUrl;
      await waitWin(win);
      await new Promise(function (r) { setTimeout(r, 1000); });
    } else {
      console.log('🎉 No more unlocked activities found. All course modules and chapters 100% complete!');
      keepRunning = false;
      break;
    }
  }

  try { win.close(); } catch(e) {}
  alert('🎉 ALL MODULES & CHAPTERS COMPLETED!\\nReloading main page now with all activities green...');
  window.location.reload();
})();`;

  // 2. TAMPERMONKEY USERSCRIPT (100% AUTOMATIC & NATIVELY SURVIVES PAGE RELOADS)
  const userscriptEngineScript = `// ==UserScript==
// @name         Moodle LMS Universal Auto-Completer (Module Detection + Skip Done)
// @namespace    https://lms.mitwpu.edu.in/
// @version      4.0.0
// @description  Full Module Detection: Skips 'Done' videos, plays pending videos for 3.5s at 16x speed, auto-reloads to unlock 1.4, and advances!
// @author       Universal Course Completer
// @match        https://lms.mitwpu.edu.in/*
// @match        https://*/*mod/book/*
// @match        https://*/*mod/videotime/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';
  var VIDEO_SECONDS = 3.5;

  console.log('%c🚀 Tampermonkey Course Completer Active (Module Detection + Skip Done)...', 'color:#10b981;font-weight:bold;');

  // Helper: detect if container has "Done" or checkmark
  var isDone = function (el) {
    if (!el) return false;
    var container = el.closest('.activity-item, .activity, .modtype_videotime, .modtype_book, li, .card, .section, tr') || el.parentElement;
    if (!container) return false;
    var badges = container.querySelectorAll('.badge, [data-region="completion-info"], .completion-info, .automatic-completion-conditions, .autocompletion');
    for (var i = 0; i < badges.length; i++) {
      var t = (badges[i].innerText || '').toLowerCase();
      if (t.includes('done') || t.includes('completed')) return true;
    }
    return container.querySelectorAll('.fa-check, .fa-check-circle, svg.text-success, .text-success').length > 0;
  };

  // Find videos on page
  var videos = Array.from(document.querySelectorAll('video, .vjs-tech, [id*="videojs"] video'));
  if (videos.length > 0) {
    console.log('🎬 Found ' + videos.length + ' video(s)! Checking completion...');
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      if (isDone(v)) {
        console.log('⏭️ Video ' + (i + 1) + '/' + videos.length + ' has "Done" badge. Skipping...');
        continue;
      }

      console.log('▶️ Playing Video ' + (i + 1) + '/' + videos.length + ' at 16x speed...');
      v.muted = true;
      v.playbackRate = 16.0;
      var playBtn = v.parentElement ? v.parentElement.querySelector('.vjs-big-play-button, button.vjs-play-control, .ytp-play-button') : null;
      if (!playBtn) playBtn = v;
      if (playBtn && typeof playBtn.click === 'function') try { playBtn.click(); } catch(e) {}
      try { await v.play(); } catch(e) {}
      await new Promise(function (r) { setTimeout(r, VIDEO_SECONDS * 1000); });
      if (v.duration && !isNaN(v.duration)) {
        v.currentTime = Math.max(0, v.duration - 0.2);
      }
      v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
      v.dispatchEvent(new Event('ended', { bubbles: true }));
      v.dispatchEvent(new Event('pause', { bubbles: true }));
      console.log('✅ Video ' + (i + 1) + '/' + videos.length + ' marked 100% complete!');
    }
  }

  // Reload once to register completion and unlock next chapter
  var currentClean = window.location.href.split('#')[0];
  var hasVisited = sessionStorage.getItem('JUST_COMPLETED_' + currentClean);

  if (!hasVisited && (videos.length > 0 || window.location.href.includes('/mod/book/'))) {
    sessionStorage.setItem('JUST_COMPLETED_' + currentClean, 'true');
    console.log('🔄 Chapter completed! Reloading page to update Moodle completion rules & unlock 1.4...');
    await new Promise(function (r) { setTimeout(r, 1200); });
    window.location.reload();
    return;
  }

  // After reload: look for Next Chapter link or Next Activity
  var nextNav = document.querySelector(
    '.nav-next a, a.nav-next, .arrow_link.next, a[title*="Next chapter"], a[aria-label*="Next chapter"], .book-next a, [data-action="next-chapter"]'
  );
  if (nextNav && nextNav.href) {
    console.log('🎯 [NEXT CHAPTER DETECTED AFTER RELOAD]: Navigating to -> ' + nextNav.href);
    setTimeout(function () { window.location.href = nextNav.href; }, 1500);
    return;
  }

  // Check Table of Contents for next chapter (1.4, 1.5...)
  var tocLinks = Array.from(document.querySelectorAll('.book_toc a, .block_book_toc a, nav.toc a, a[href*="chapterid="]'));
  var curIdx = tocLinks.findIndex(function (a) { return a.href.split('#')[0] === currentClean; });
  if (curIdx >= 0 && curIdx + 1 < tocLinks.length) {
    var nextChapter = tocLinks[curIdx + 1];
    if (!nextChapter.closest('.dimmed_text, .restricted, .locked')) {
      console.log('🎯 [NEXT CHAPTER IN TOC DETECTED]: Navigating to -> ' + nextChapter.href);
      setTimeout(function () { window.location.href = nextChapter.href; }, 1500);
      return;
    }
  }

  // Next activity on course (valid CSS selectors)
  var nextAct = document.querySelector(
    '.activity-navigation .next-activity a, .activity-navigation a[title*="Next"], #next-activity-link, .nav-next a, .next_activity a'
  );
  if (nextAct && nextAct.href) {
    console.log('🎯 [NEXT MODULE DETECTED]: Navigating to next activity -> ' + nextAct.href);
    setTimeout(function () { window.location.href = nextAct.href; }, 1800);
  }
})();`;

  // 3. IN-TAB AUTOPILOT (ZERO POPUPS AT ALL - NAVIGATES THE ACTIVE TAB DIRECTLY)
  const inTabAutopilotScript = `// 🚀 IN-TAB AUTOPILOT (Module Detection + Skips "Done" Activities)
(function () {
  // Helper: check if element is marked 'Done'
  var isDone = function (el) {
    var c = el.closest('.activity-item, .activity, li, .card') || el.parentElement;
    if (!c) return false;
    var badges = c.querySelectorAll('.badge, [data-region="completion-info"], .completion-info');
    for (var i = 0; i < badges.length; i++) {
      if ((badges[i].innerText || '').toLowerCase().includes('done')) return true;
    }
    return c.querySelectorAll('.fa-check, .text-success').length > 0;
  };

  var rawLinks = Array.from(document.querySelectorAll(
    '.activity-item a.aalink, .activityinstance a, li.activity a, a[href*="/mod/"]'
  ));

  var pendingLinks = [];
  var doneCount = 0;

  for (var i = 0; i < rawLinks.length; i++) {
    var href = rawLinks[i].href ? rawLinks[i].href.split('#')[0] : '';
    if (!href || href.includes('delete') || href.includes('edit')) continue;
    if (pendingLinks.indexOf(href) !== -1) continue;

    if (isDone(rawLinks[i])) {
      doneCount++;
      continue;
    }
    pendingLinks.push(href);
  }

  if (!pendingLinks.length) {
    alert('🎉 All detected course activities are already "Done"! (' + doneCount + ' skipped)');
    return;
  }

  sessionStorage.setItem('COMPLETER_QUEUE', JSON.stringify(pendingLinks));
  sessionStorage.setItem('COMPLETER_HOME', window.location.href);
  sessionStorage.setItem('COMPLETER_ACTIVE', '1');

  alert('Found ' + pendingLinks.length + ' pending activities (' + doneCount + ' "Done" skipped)! Starting in-tab auto-play now.');
  window.location.href = pendingLinks[0];
})();`;

  // 4. SINGLE VIDEO 1-LINER WITH 'DONE' SKIP & RELOAD
  const singleVideoOneLiner = `(async function(){var b=document.querySelector('.badge, [data-region="completion-info"]');if(b&&(b.innerText||'').toLowerCase().includes('done')){console.log('⏭️ Video already marked "Done"! Skipping...');return;}var v=document.querySelector('video')||document.querySelector('.vjs-tech')||document.querySelector('[id*="videojs"] video');if(v){v.muted=true;v.playbackRate=16;await v.play().catch(function(){});console.log('🎬 Playing video for 3.5s...');await new Promise(function(r){setTimeout(r,3500);});v.currentTime=Math.max(0,(v.duration||10)-0.2);v.dispatchEvent(new Event('timeupdate',{bubbles:true}));v.dispatchEvent(new Event('ended',{bubbles:true}));console.log('✅ Video 100% completed!');}console.log('🔄 Reloading page to update completion status & unlock next chapter (1.4)...');sessionStorage.setItem('JUST_COMPLETED_ONCE','1');window.location.reload();})();`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl text-slate-200">
      {/* Top Banner with direct answer to user request */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Course Completer &bull; Module Detection &amp; Skip &quot;Done&quot; Videos
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            <b>Updated with Module Detection &amp; &quot;Done&quot; skipping:</b> Auto-expands all modules across your course, automatically skips any video/lesson already marked <span className="bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">Done</span>, plays only pending videos for 3.5s at 16x speed, and reloads to unlock <b>Chapter 1.4</b>!
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

      {/* Feature Highlights: Module Detection & Skip Done */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-950/70 border border-blue-500/30 rounded-lg p-3 text-xs flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/40">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <b className="text-white text-xs">Module Detection Engine</b>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Scans all course sections, auto-clicks collapsed accordions, and queries the live syllabus to discover every module and chapter link on <code className="text-blue-300">lms.mitwpu.edu.in</code>.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <b className="text-white text-xs">Skip &quot;Done&quot; Detection</b>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Checks Moodle completion badges (<code className="text-emerald-300 font-mono">.badge:contains(&quot;Done&quot;)</code>, green checkmarks, and completion checkboxes). Any finished video is instantly skipped.
            </p>
          </div>
        </div>
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
              Go to your course overview on <code className="text-blue-300">lms.mitwpu.edu.in</code> or inside any Book chapter.
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
              Automatically detects all modules, skips &quot;Done&quot; items, plays pending videos, reloads, and unlocks 1.4!
            </p>
          </div>
        </div>
      </div>

      {/* Script Mode Selector */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('popup')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'popup'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Option 1: Pop-up Auto-Reload Engine (Recommended Console Script)</span>
        </button>
        <button
          onClick={() => setActiveTab('userscript')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'userscript'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Option 2: Tampermonkey Userscript (Native Auto-Reload)</span>
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'single'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Option 3: 1-Liner For Single Video Page</span>
        </button>
        <button
          onClick={() => setActiveTab('inTab')}
          className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'inTab'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Option 4: In-Tab Autopilot (Queue Mode)</span>
        </button>
      </div>

      {/* Tab 1: Pop-up Helper Window (Primary) */}
      {activeTab === 'popup' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                Pop-up Auto-Reload Engine (Module Detection + Skip &quot;Done&quot; + Auto-Reload 1.4)
              </h3>
              <p className="text-xs text-slate-400">
                Full syllabus detection &bull; Skips any video marked &quot;Done&quot; &bull; Plays 3.5s &bull; Reloads to unlock 1.4.
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

          <pre className="p-4 bg-black/60 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 select-text leading-relaxed">
            <code>{popupWindowEngineScript}</code>
          </pre>
        </div>
      )}

      {/* Tab 2: Tampermonkey Userscript */}
      {activeTab === 'userscript' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                Tampermonkey Userscript (Native Reload &bull; Skip &quot;Done&quot; &bull; Background Advance)
              </h3>
              <p className="text-xs text-slate-400">
                Install in Tampermonkey extension: automatically hooks chapters, skips Done videos, plays 3.5s, reloads, and clicks 1.4!
              </p>
            </div>
            <button
              onClick={() => handleCopy('userscript', userscriptEngineScript)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              {copiedId === 'userscript' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'userscript' ? 'Copied Userscript!' : 'Copy Userscript'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/60 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 select-text leading-relaxed">
            <code>{userscriptEngineScript}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Single Video 1-Liner */}
      {activeTab === 'single' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                1-Liner: Check &quot;Done&quot; &bull; Play 3.5s &bull; Complete 100% &bull; Reload to Unlock 1.4
              </h3>
              <p className="text-xs text-slate-400">
                If you are currently on a chapter page and just want to finish it, reload, and unlock 1.4.
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

      {/* Tab 4: In-Tab Autopilot */}
      {activeTab === 'inTab' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                In-Tab Autopilot (Module Detection &bull; Zero Popups &bull; Skips &quot;Done&quot;)
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
    </div>
  );
};
