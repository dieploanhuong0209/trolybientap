import React, { useState } from 'react';
import { RotateCcw, Copy, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { GeneratedSection } from '../types';

interface Props {
  section: GeneratedSection;
  onReplay: (id: string) => void;
  onCopy: (content: string) => void;
  onVersionChange?: (id: string, newIndex: number) => void;
}

const OutputBox: React.FC<Props> = ({ section, onReplay, onCopy, onVersionChange }) => {
  const [copied, setCopied] = useState(false);
  // Default to open if it's currently regenerating, otherwise open by default as well
  const [isOpen, setIsOpen] = useState(true);

  // Determine which content to show
  // Fallback to empty string if history is undefined (safety check)
  const currentContent = section.history && section.history[section.currentIndex] 
    ? section.history[section.currentIndex] 
    : '';

  const totalVersions = section.history ? section.history.length : 1;
  const currentVersionDisplay = (section.currentIndex || 0) + 1;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReplay(section.id);
    if (!isOpen) setIsOpen(true);
  };

  const handlePrevVersion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVersionChange && section.currentIndex > 0) {
      onVersionChange(section.id, section.currentIndex - 1);
    }
  };

  const handleNextVersion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVersionChange && section.currentIndex < totalVersions - 1) {
      onVersionChange(section.id, section.currentIndex + 1);
    }
  };

  return (
    <div 
      className={`
        group transition-all duration-500 ease-in-out
        bg-white/60 backdrop-blur-xl border border-white/40
        ${isOpen 
          ? 'rounded-3xl shadow-[0_20px_40px_-15px_rgba(168,195,212,0.3)]' 
          : 'rounded-2xl shadow-[0_8px_20px_-6px_rgba(168,195,212,0.4)] hover:shadow-[0_12px_25px_-8px_rgba(168,195,212,0.6)] hover:bg-white/80'
        }
      `}
    >
      {/* Header / Toggle Button Area */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex justify-between items-center cursor-pointer select-none min-h-[80px]"
      >
        <div className="flex items-center">
           {/* Styled Title Button Container */}
           <div className={`
             flex items-center space-x-3 px-5 py-2.5 rounded-2xl border transition-all duration-300
             ${isOpen 
               ? 'bg-[#db88a4] border-[#db88a4] shadow-[0_8px_16px_-4px_rgba(219,136,164,0.5)] transform -translate-y-0.5' 
               : 'bg-white/40 border-white/40 shadow-sm hover:bg-white/60 hover:shadow-md'
             }
           `}>
             {/* Status Dot */}
             <div className={`
                w-2 h-2 rounded-full transition-all duration-500 flex-shrink-0
                ${isOpen ? 'bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#94a3b8]'}
             `} />
             
             {/* Title Text */}
             <h3 className={`
                font-serif font-bold tracking-wide text-base transition-colors duration-300
                ${isOpen ? 'text-white' : 'text-[#64748b]'}
             `}>
              {section.title}
             </h3>
           </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Actions */}
          <div className={`flex items-center space-x-1 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <button
              onClick={handleReplay}
              disabled={section.isRegenerating}
              title="Biên tập lại (Tạo bản mới)"
              className={`p-2 rounded-full transition-all hover:bg-white/80 focus:outline-none active:scale-95 ${section.isRegenerating ? 'text-[#a8c3d4]' : 'text-[#64748b] hover:text-[#db88a4]'}`}
            >
              <RotateCcw className={`w-4 h-4 ${section.isRegenerating ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleCopy}
              title="Sao chép bản hiện tại"
              className="p-2 rounded-full transition-all hover:bg-white/80 text-[#64748b] hover:text-[#db88a4] focus:outline-none active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="w-px h-5 bg-[#a8c3d4]/40 mx-2"></div>

          <div className={`
            p-1.5 rounded-full transition-all duration-300 text-[#64748b]
            ${isOpen ? 'bg-white/40 rotate-180 text-[#334155]' : 'group-hover:text-[#334155]'}
          `}>
             <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div 
        className={`
          overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out
          ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-6 pt-0">
          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/60 to-transparent mb-6"></div>
          
          <div className="bg-white/20 rounded-2xl p-6 min-h-[100px] flex flex-col">
            {section.isRegenerating ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-[#a8c3d4]/30 rounded-full w-3/4"></div>
                <div className="h-4 bg-[#a8c3d4]/30 rounded-full w-full"></div>
                <div className="h-4 bg-[#a8c3d4]/30 rounded-full w-5/6"></div>
                <div className="h-24 bg-[#a8c3d4]/20 rounded-xl w-full mt-4"></div>
              </div>
            ) : (
               // Key change triggers simple fade effect
               <div key={section.currentIndex} className="animate-in fade-in duration-300">
                  <MarkdownRenderer content={currentContent} />
               </div>
            )}
            
            {/* Version Navigation (Slide History) */}
            {!section.isRegenerating && totalVersions > 1 && (
              <div className="mt-6 pt-4 border-t border-white/40 flex items-center justify-between">
                <button
                  onClick={handlePrevVersion}
                  disabled={section.currentIndex === 0}
                  className={`flex items-center px-3 py-1.5 rounded-xl transition-all ${
                    section.currentIndex === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-[#64748b] hover:bg-white/40 hover:text-[#334155]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Trước</span>
                </button>

                <div className="bg-[#a8c3d4]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#64748b] tracking-wider border border-[#a8c3d4]/40 shadow-sm">
                  OPTION {currentVersionDisplay} / {totalVersions}
                </div>

                <button
                  onClick={handleNextVersion}
                  disabled={section.currentIndex === totalVersions - 1}
                  className={`flex items-center px-3 py-1.5 rounded-xl transition-all ${
                    section.currentIndex === totalVersions - 1
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-[#64748b] hover:bg-white/40 hover:text-[#334155]'
                  }`}
                >
                  <span className="text-xs font-medium">Sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputBox;