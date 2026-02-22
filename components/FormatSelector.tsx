import React from 'react';
import { FormatType } from '../types';
import { Share2, FileText, Video, Mic2, FileEdit } from 'lucide-react';

interface Props {
  selectedFormats: FormatType[];
  activeFormat: FormatType | null;
  onToggle: (format: FormatType) => void;
}

const FormatSelector: React.FC<Props> = ({ selectedFormats, activeFormat, onToggle }) => {
  const options: { id: FormatType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'social', 
      label: 'Social Post', 
      icon: <FileEdit className="w-4 h-4" />,
      description: 'Bài đăng đa kênh (FB/Zalo) với icon & hashtag.'
    },
    { 
      id: 'share_link', 
      label: 'Caption Share Link', 
      icon: <Share2 className="w-4 h-4" />,
      description: 'Caption ngắn gọn, giật tít để chia sẻ link.'
    },
    { 
      id: 'viral_clip', 
      label: 'Viral Video', 
      icon: <Mic2 className="w-4 h-4" />,
      description: 'Kịch bản video ngắn có voice-over.'
    },
    { 
      id: 'mutex_video', 
      label: 'Mutex Video', 
      icon: <Video className="w-4 h-4" />,
      description: 'Video không lời bình, tập trung visual.'
    },
    { 
      id: 'editorial', 
      label: 'Editorial', 
      icon: <FileText className="w-4 h-4" />,
      description: 'Biên tập lại bài viết theo phong cách báo chí.'
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {options.map((opt) => {
        const isSelected = selectedFormats.includes(opt.id);
        const isActive = activeFormat === opt.id;

        return (
          <div key={opt.id} className="relative group">
            <button
              onClick={() => onToggle(opt.id)}
              className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all duration-300 h-full ${
                isSelected
                  ? 'bg-[#db88a4] text-white shadow-[0_8px_16px_-4px_rgba(219,136,164,0.4)] transform scale-105'
                  : 'bg-white/40 text-[#64748b] border-white/50 hover:bg-white/80 hover:text-[#334155] hover:border-[#db88a4]/30'
              } ${
                isActive && isSelected 
                  ? 'ring-2 ring-offset-2 ring-[#db88a4] border-transparent' 
                  : isSelected ? 'border-[#db88a4]' : ''
              }`}
            >
              <div className={`mb-1.5 ${isSelected ? 'text-white' : ''}`}>
                {opt.icon}
              </div>
              <span className={`text-[10px] font-medium text-center tracking-wide ${isSelected ? 'font-bold' : ''}`}>
                {opt.label}
              </span>
            </button>
            
            {/* Tooltip Popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-40 p-3 bg-[#334155]/90 backdrop-blur-md text-white text-[10px] leading-relaxed text-center rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none translate-y-2 group-hover:translate-y-0">
              {opt.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#334155]/90"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormatSelector;