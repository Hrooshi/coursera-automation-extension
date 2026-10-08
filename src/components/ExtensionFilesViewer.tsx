import React, { useState } from 'react';
import { EXTENSION_FILES, downloadExtensionZip } from '../utils/extensionGenerator';
import { Download, Copy, Check, FileCode, FolderArchive, Terminal, ExternalLink } from 'lucide-react';

export const ExtensionFilesViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentFile = EXTENSION_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadExtensionZip();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col gap-0 shadow-xl">
      {/* Top action header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Universal Chrome Extension Source Package
            </h3>
            <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded-full font-mono">
              Manifest V3 Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Converted from Coursera-only to work universally on <b>all course platforms & HTML5 videos</b> (Moodle, Video.js, Canvas, Coursera, etc.)
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Packaging ZIP...' : 'Download Unpacked Extension (.ZIP)'}</span>
        </button>
      </div>

      {/* Main File Browser & Code Editor */}
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[440px]">
        {/* Left file tree */}
        <div className="bg-slate-950/60 border-r border-slate-800 p-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Package Files
          </span>
          {EXTENSION_FILES.map((file, idx) => {
            const isSelected = selectedFileIndex === idx;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className={`text-[9px] uppercase px-1 rounded ${isSelected ? 'bg-blue-700 text-blue-100' : 'text-slate-400'}`}>
                  {file.language}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Code Content Viewer */}
        <div className="md:col-span-3 flex flex-col bg-slate-950">
          <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-semibold text-slate-200">{currentFile.path}</span>
              <span className="text-slate-400 text-[11px] ml-2 font-sans">{currentFile.description}</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-[460px] select-text">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
