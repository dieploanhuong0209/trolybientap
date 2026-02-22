import React from 'react';
import { EditorConfig, MEDIA_GROUPS, MediaGroup, FormatType } from '../types';
import { ChevronUp, ChevronDown, Sliders, X } from 'lucide-react';

interface Props {
  config: EditorConfig;
  activeFormat: FormatType | null;
  onChange: (newConfig: Partial<EditorConfig>) => void;
}

const ConfigPanel: React.FC<Props> = ({ config, activeFormat, onChange }) => {
  const handleQuantityChange = (val: number) => {
    // Clamp between 1 and 10
    const newVal = Math.min(10, Math.max(1, val));
    onChange({ quantity: newVal });
  };

  if (!activeFormat || !config.formats.includes(activeFormat)) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-[#64748b] space-y-2 py-2">
         <Sliders className="w-5 h-5 text-[#a8c3d4]" />
         <p className="text-xs italic font-serif">Chọn hoặc click vào một định dạng để cấu hình</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
      {activeFormat === 'social' && (
         <div className="flex flex-col space-y-3 w-full">
            <div className="group w-full">
               <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1.5 group-focus-within:text-[#db88a4] transition-colors">
                  Yêu cầu thêm (Context/Tone/Note)
               </label>
               <div className="relative">
                 <textarea
                    value={config.socialRequirement || ''}
                    onChange={(e) => onChange({ socialRequirement: e.target.value })}
                    placeholder="VD: Giọng văn hài hước, tập trung vào khuyến mãi 50%, nhấn mạnh yếu tố gia đình..."
                    rows={2}
                    className="w-full px-4 py-2 pr-8 bg-white/40 border border-white/60 rounded-xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 focus:outline-none text-[#334155] text-xs shadow-sm resize-none transition-all placeholder:text-[#94a3b8] font-sans"
                 />
                 {config.socialRequirement && config.socialRequirement.length > 0 && (
                   <button
                     onClick={() => onChange({ socialRequirement: '' })}
                     className="absolute right-2 top-2 p-1 rounded-full text-[#94a3b8] hover:text-[#db88a4] hover:bg-white/60 transition-all focus:outline-none"
                     title="Xóa nội dung"
                   >
                     <X className="w-3.5 h-3.5" />
                   </button>
                 )}
               </div>
            </div>
         </div>
      )}

      {(activeFormat === 'viral_clip' || activeFormat === 'mutex_video') && (
        <div className="group">
          <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1.5 group-focus-within:text-[#db88a4] transition-colors">Thời lượng Video ({activeFormat === 'viral_clip' ? 'Viral' : 'Mutex'})</label>
          <div className="relative">
            <select
              value={config.duration}
              onChange={(e) => onChange({ duration: e.target.value })}
              className="w-full px-4 py-2 bg-white/40 border border-white/60 rounded-xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 focus:outline-none text-[#334155] text-sm shadow-sm appearance-none transition-all cursor-pointer"
            >
              <option value="15s">15 giây (Story/Shorts)</option>
              <option value="30s">30 giây (TVC/TikTok)</option>
              <option value="60s">60 giây (Standard)</option>
              <option value="90s">90 giây (Detail)</option>
              <option value="3 phút">3 phút (Review/Report)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#64748b]">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-[#64748b] italic">
             Thời lượng ước tính để Trợ lý phân bổ nội dung kịch bản phù hợp.
          </p>
        </div>
      )}

      {activeFormat === 'editorial' && (
        <div className="space-y-4">
           <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest border-b border-white/40 pb-2 mb-3">Editorial Settings</h4>
          <div>
            <div className="space-y-2">
              {(Object.keys(MEDIA_GROUPS) as MediaGroup[]).map((groupKey) => (
                <label
                  key={groupKey}
                  className={`flex items-start p-2.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                    config.mediaGroup === groupKey 
                    ? 'bg-white/60 border-[#db88a4]/40 shadow-sm' 
                    : 'bg-white/20 border-transparent hover:bg-white/40 hover:border-white/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="mediaGroup"
                    value={groupKey}
                    checked={config.mediaGroup === groupKey}
                    onChange={() => onChange({ mediaGroup: groupKey })}
                    className="mt-1 h-3.5 w-3.5 text-[#db88a4] focus:ring-[#db88a4] border-[#D6CCC2] accent-[#db88a4] flex-shrink-0"
                  />
                  <div className="ml-2.5">
                    <span className={`block text-xs font-semibold ${config.mediaGroup === groupKey ? 'text-[#334155]' : 'text-[#64748b]'}`}>
                      {MEDIA_GROUPS[groupKey].label} <span className="font-normal opacity-75">({MEDIA_GROUPS[groupKey].examples})</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Mức độ biên tập (Rewrite)</label>
              <span className="text-xs font-bold text-[#334155]">{config.editPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={config.editPercent}
              onChange={(e) => onChange({ editPercent: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-[#a8c3d4]/50 rounded-lg appearance-none cursor-pointer accent-[#db88a4]"
            />
          </div>
        </div>
      )}

      {activeFormat === 'share_link' && (
         <div className="flex flex-col items-center justify-center min-h-[80px] text-center space-y-2">
            <p className="text-sm text-[#334155]">Không có cấu hình riêng cho Share Link.</p>
            <p className="text-[10px] text-[#64748b] italic">Trợ lý sẽ tự động tạo caption ngắn gọn, thu hút click dựa trên nội dung Input.</p>
         </div>
      )}
    </div>
  );
};

export default ConfigPanel;