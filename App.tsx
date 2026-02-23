import React, { useState, useRef, useEffect } from 'react';
import { EditorConfig, FormatType, GeneratedSection, SectionType } from './types';
import { generateContent, generateSingleSection } from './services/geminiService.ts';
import FormatSelector from './components/FormatSelector';
import ConfigPanel from './components/ConfigPanel';
import OutputBox from './components/OutputBox';
import { Send, AlertCircle, RotateCcw, Feather, Link as LinkIcon, Hourglass, Square, Ban, AlertTriangle } from 'lucide-react';

// Custom 5-Petal Flower Icon
const FivePetalFlower = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="2.5" />
    {[0, 72, 144, 216, 288].map((deg) => (
       <path
         key={deg}
         d="M12 2C13.5 4.5 14 6 12 9.5C10 6 10.5 4.5 12 2Z" 
         transform={`rotate(${deg} 12 12)`}
       />
    ))}
  </svg>
);

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [sapo, setSapo] = useState<string>('');
  const [body, setBody] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  
  // Track which format is currently focused for configuration
  const [activeFormat, setActiveFormat] = useState<FormatType | null>('social');
  
  const [config, setConfig] = useState<EditorConfig>({
    formats: ['social'],
    quantity: 1, // Default to 1 as selector is hidden
    socialRequirement: '', // Default empty string
    duration: '60s',
    mediaGroup: 'political',
    editPercent: 30,
  });

  const [loadingText, setLoadingText] = useState("Trợ lý đang biên tập...");
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  
  const outputEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto scroll to bottom when sections update
  useEffect(() => {
    if (sections.length > 0 && isGenerating) {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sections, isGenerating]);

  // Rotate loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
        const messages = [
            "Trợ lý đang biên tập...",
            "Hít vào... thở ra... đợi xíu nhé...",
            "Đang lục lọi kho từ vựng phong phú...",
            "Sắp xong rồi, đừng hối nha...",
            "Đang 'múa bút' tạo content xịn...",
            "Đợi xíu, đang bắt sóng cảm xúc...",
            "Đang trau chuốt từng câu chữ..."
        ];
        let i = 0;
        // Change text every 3 seconds
        interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingText(messages[i]);
        }, 3000);
    } else {
        setLoadingText("Trợ lý đang biên tập...");
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Validation Logic
  const hasContent = url.trim().length > 0 || title.trim().length > 0 || sapo.trim().length > 0 || body.trim().length > 0;
  const hasFormat = config.formats.length > 0;

  const handleConfigChange = (newConfig: Partial<EditorConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleFormatChange = (format: FormatType) => {
    const isSelected = config.formats.includes(format);
    const isActive = activeFormat === format;

    if (isSelected) {
      if (isActive) {
        // If clicked while Selected AND Active -> Deselect (Toggle OFF)
        const newFormats = config.formats.filter(f => f !== format);
        setConfig(prev => ({ ...prev, formats: newFormats }));
        // Switch active to another selected format if available, else null
        setActiveFormat(newFormats.length > 0 ? newFormats[newFormats.length - 1] : null);
      } else {
        // If clicked while Selected but NOT Active -> Just set Active (Focus)
        setActiveFormat(format);
      }
    } else {
      // If clicked while NOT Selected -> Select AND Set Active
      setConfig(prev => ({ ...prev, formats: [...prev.formats, format] }));
      setActiveFormat(format);
    }
  };

  // Helper to parse the AI response string into structured sections
  const parseSections = (fullText: string): GeneratedSection[] => {
    const rawSections = fullText.split('<<<SECTION:');
    const parsed: GeneratedSection[] = [];

    // Map internal tags to friendly display titles
    const typeMap: Record<string, { type: SectionType, title: string }> = {
        'AUDIT>>>': { type: 'audit', title: 'Đánh giá tổng quan' },
        'SOCIAL>>>': { type: 'social', title: 'Social Post' },
        'SHARE_LINK>>>': { type: 'share_link', title: 'Caption Share Link' },
        'VIRAL_CLIP>>>': { type: 'viral_clip', title: 'Kịch bản Viral Video' },
        'MUTEX_VIDEO>>>': { type: 'mutex_video', title: 'Kịch bản Mutex Video' },
        'EDITORIAL>>>': { type: 'editorial', title: 'Bài biên tập (Editorial)' },
    };

    rawSections.forEach((chunk, index) => {
        if (!chunk.trim()) return;

        const lines = chunk.split('\n');
        const firstLine = lines[0].trim(); // This should be " TAG>>>"
        const content = lines.slice(1).join('\n').trim();

        const match = Object.keys(typeMap).find(key => firstLine.startsWith(key));
        
        if (match) {
            const info = typeMap[match];
            parsed.push({
                id: `sec-${Date.now()}-${index}`,
                type: info.type,
                title: info.title,
                history: [content], // Initialize history
                currentIndex: 0,
                isRegenerating: false
            });
        }
    });
    
    // Sort sections based on defined order: Audit -> Social -> Share Link -> Viral -> Mutex -> Editorial
    const sortOrder: SectionType[] = ['audit', 'social', 'share_link', 'viral_clip', 'mutex_video', 'editorial'];

    return parsed.sort((a, b) => {
        return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsHoveringButton(false);
    setLoadingText("Đã dừng xử lý.");
    // Optional: Add a 'cancelled' section or just leave partial data
  };

  const handleGenerate = async () => {
    if (!hasContent || !hasFormat) return;
    
    // If already generating, clicking again (without hover stop logic) should do nothing or be handled by handleStop
    if (isGenerating) {
        handleStop();
        return;
    }

    setIsGenerating(true);
    setSections([]); // Clear previous output
    
    // Init AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const rawText = await generateContent({ url, title, sapo, body }, config);
      
      // Check if aborted before updating state
      if (controller.signal.aborted) return;

      const newSections = parseSections(rawText);
      
      if (newSections.length === 0) {
        setSections([{
            id: 'fallback-1',
            type: 'audit',
            title: 'Kết quả xử lý',
            history: [rawText],
            currentIndex: 0,
            isRegenerating: false
        }]);
      } else {
        setSections(newSections);
      }

    } catch (error) {
      if (controller.signal.aborted) return;
      
      setSections([{
          id: 'error-1',
          type: 'audit',
          title: 'Lỗi hệ thống',
          history: ['Đã xảy ra lỗi khi kết nối với Athena. Vui lòng thử lại sau.'],
          currentIndex: 0,
          isRegenerating: false
      }]);
      console.error(error);
    } finally {
      if (!controller.signal.aborted) {
         setIsGenerating(false);
         abortControllerRef.current = null;
      }
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const sectionToRegen = sections[sectionIndex];
    
    // Set regenerating state for this specific box
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = { ...sectionToRegen, isRegenerating: true };
    setSections(updatedSections);

    try {
        const newContent = await generateSingleSection(
            { url, title, sapo, body }, 
            config, 
            sectionToRegen.type
        );
        
        // Update content: Push new version to history and update index
        setSections(prev => {
            const next = [...prev];
            const currentSec = next[sectionIndex];
            next[sectionIndex] = { 
                ...currentSec, 
                history: [...currentSec.history, newContent],
                currentIndex: currentSec.history.length, 
                isRegenerating: false 
            };
            return next;
        });

    } catch (error) {
        console.error("Regen error", error);
        // Revert loading state on error
        setSections(prev => {
            const next = [...prev];
            next[sectionIndex] = { ...sectionToRegen, isRegenerating: false };
            return next;
        });
        alert("Không thể tạo lại nội dung lúc này.");
    }
  };

  const handleVersionChange = (sectionId: string, newIndex: number) => {
    setSections(prev => prev.map(sec => {
        if (sec.id === sectionId) {
            // Validate index bounds
            if (newIndex >= 0 && newIndex < sec.history.length) {
                return { ...sec, currentIndex: newIndex };
            }
        }
        return sec;
    }));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const resetEditor = () => {
    setUrl('');
    setTitle('');
    setSapo('');
    setBody('');
    setSections([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#a8c3d4] via-[#dbd6df] to-[#eec6c7]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/40 border-b border-white/30">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#738fbd] p-2 rounded-xl shadow-[0_4px_10px_rgba(115,143,189,0.3)]">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#334155] tracking-tight font-serif">Trợ lý biên tập</h1>
              <p className="text-[10px] text-[#64748b] font-medium tracking-widest uppercase">Trợ lý nội dung đa nền tảng</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/30 px-3 py-1.5 rounded-full border border-white/40">
             <div className={`h-2 w-2 rounded-full ring-2 ring-white/60 ${import.meta.env.VITE_API_KEY ? 'bg-emerald-400' : 'bg-[#db88a4]'}`} />

      <span className="text-xs text-[#64748b] font-medium">
{import.meta.env.VITE_API_KEY ? 'System Ready' : 'Key Missing'}
</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input & Config (Occupies 5/12) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col h-full">
            
            {/* Input Area */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_40px_-15px_rgba(168,195,212,0.3)] flex flex-col flex-grow min-h-[400px] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(168,195,212,0.5)]">
              <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
                <h2 className="font-serif font-semibold text-lg text-[#334155] flex items-center">
                  <span className="w-1.5 h-5 bg-[#738fbd] rounded-full mr-3 opacity-80"></span>
                  Nội dung gốc (Input)
                </h2>
                <button 
                  onClick={resetEditor}
                  className="text-xs font-medium text-[#64748b] hover:text-[#db88a4] flex items-center transition-colors bg-white/40 px-3 py-1.5 rounded-full border border-white/50 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Làm mới
                </button>
              </div>
              
              <div className="p-6 space-y-5 flex-grow overflow-y-auto custom-scrollbar">
                {/* URL Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#db88a4] transition-colors">Link bài viết (Tùy chọn)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Dán link bài viết vào đây..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white/60 border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 focus:outline-none text-[#334155] shadow-sm transition-all placeholder:text-[#94a3b8]"
                    />
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  </div>
                  
                  {/* WARNING ALERT FOR EDITORIAL + URL */}
                  {config.formats.includes('editorial') && url.trim().length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <span className="font-bold block mb-0.5">Khuyến nghị nhập thủ công</span>
                        Để đảm bảo kết quả <strong>Editorial</strong> chuẩn xác nhất, vui lòng copy nội dung và dán trực tiếp vào các ô Title/Body bên dưới thay vì chỉ dùng Link.
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-white/40"></div>
                  <span className="flex-shrink-0 mx-3 text-[10px] text-[#64748b]/80 font-bold tracking-widest uppercase">Hoặc nhập thủ công</span>
                  <div className="flex-grow border-t border-white/40"></div>
                </div>

                {/* Title Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#db88a4] transition-colors">Tiêu đề (Title)</label>
                  <div className="relative">
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề bài viết..."
                      rows={2}
                      className="w-full p-4 text-base bg-white/40 text-[#334155] border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 outline-none resize-none shadow-inner transition-all placeholder:text-[#94a3b8] font-serif"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#64748b] font-medium select-none bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {getWordCount(title)} từ
                    </span>
                  </div>
                </div>

                {/* Sapo Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#db88a4] transition-colors">Sapo</label>
                  <div className="relative">
                    <textarea
                      value={sapo}
                      onChange={(e) => setSapo(e.target.value)}
                      placeholder="Nhập đoạn Sapo (mô tả ngắn)..."
                      rows={3}
                      className="w-full p-4 text-sm bg-white/40 text-[#334155] border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 outline-none resize-none shadow-inner transition-all placeholder:text-[#94a3b8]"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#64748b] font-medium select-none bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {getWordCount(sapo)} từ
                    </span>
                  </div>
                </div>

                {/* Body Input */}
                <div className="flex flex-col flex-grow group">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#db88a4] transition-colors">Thân bài (Body)</label>
                  <div className="relative flex-grow flex flex-col">
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Dán nội dung thân bài vào đây..."
                      className="w-full p-4 pb-8 text-sm bg-white/40 text-[#334155] border border-white/60 rounded-2xl focus:ring-2 focus:ring-[#db88a4]/30 focus:border-[#db88a4]/50 outline-none resize-none shadow-inner transition-all placeholder:text-[#94a3b8] flex-grow min-h-[150px]"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#64748b] font-medium select-none bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {getWordCount(body)} từ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Area - Unified Frame */}
            <div className="flex flex-col space-y-4">
               {/* Mode Selectors */}
               <FormatSelector 
                selectedFormats={config.formats} 
                activeFormat={activeFormat}
                onToggle={handleFormatChange} 
               />
               
               {/* Unified Config & Action Panel */}
               <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_40px_-15px_rgba(168,195,212,0.3)] p-5 transition-all flex flex-col justify-between">
                 {/* Config Area */}
                 <div className="mb-4 min-h-[80px] flex flex-col justify-center">
                   <ConfigPanel 
                    config={config} 
                    activeFormat={activeFormat}
                    onChange={handleConfigChange} 
                   />
                 </div>
                 
                 {/* Action Button (Inside the Frame) */}
                 <button
                  onClick={isGenerating ? handleStop : handleGenerate}
                  disabled={!isGenerating && (!hasContent || !hasFormat)}
                  onMouseEnter={() => isGenerating && setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className={`
                    w-full py-4 rounded-2xl font-serif font-bold text-lg 
                    flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]
                    ${
                      isGenerating
                        ? isHoveringButton
                          ? 'bg-[#738fbd] text-white shadow-[0_10px_25px_-5px_rgba(115,143,189,0.4)] hover:bg-[#5c7296]'
                          : 'bg-[#cbd5e1] text-[#64748b] shadow-none cursor-wait'
                        : (!hasContent || !hasFormat)
                          ? 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed shadow-none'
                          : 'bg-[#db88a4] text-white hover:bg-[#cc8eb1] shadow-[0_10px_25px_-5px_rgba(219,136,164,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(219,136,164,0.6)]'
                    }
                  `}
                >
                  {isGenerating ? (
                    isHoveringButton ? (
                      <>
                        <Square className="w-5 h-5 fill-current" />
                        <span>Dừng & Chỉnh sửa</span>
                      </>
                    ) : (
                      <>
                        <Hourglass className="animate-spin -ml-1 mr-3 h-5 w-5 opacity-70" />
                        <span className="animate-pulse">{loadingText}</span>
                      </>
                    )
                  ) : (
                    <>
                      <FivePetalFlower className="w-5 h-5 text-[#fadbe2]" />
                      <span>Xử lý & Biên tập</span>
                    </>
                  )}
                </button>
               </div>
            </div>
          </div>

          {/* Right Column: Output (Occupies 7/12) */}
          <div className="lg:col-span-7 h-full flex flex-col">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 pl-2">
                <h2 className="font-serif font-semibold text-lg text-[#334155] flex items-center">
                  <span className="w-1.5 h-5 bg-[#db88a4] rounded-full mr-3"></span>
                  Kết quả (Output)
                </h2>
              </div>
              
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-10 space-y-6">
                {!isGenerating && sections.length === 0 && (
                  <div className="h-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_40px_-15px_rgba(219,136,164,0.3)] flex flex-col items-center justify-center text-[#64748b] space-y-4 px-8 text-center min-h-[600px]">
                    <div className="w-16 h-16 rounded-full bg-white/40 border border-white/60 flex items-center justify-center shadow-lg shadow-[#dbd6df]">
                      <Send className="w-6 h-6 text-[#a8c3d4] ml-1 mt-1" />
                    </div>
                    <p className="text-sm font-medium tracking-wide font-serif text-[#64748b]/80 leading-relaxed">
                      Nhập nội dung vào các ô bên trái để bắt đầu biên tập.
                    </p>
                  </div>
                )}
                
                {isGenerating && sections.length === 0 && (
                   <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 space-y-6 animate-pulse">
                    <div className="h-4 bg-[#a8c3d4]/30 rounded-full w-3/4"></div>
                    <div className="h-4 bg-[#a8c3d4]/30 rounded-full w-1/2"></div>
                    <div className="h-32 bg-white/40 border border-white/30 rounded-2xl w-full mt-6"></div>
                   </div>
                )}

                {sections.map((section) => (
                  <OutputBox 
                    key={section.id} 
                    section={section} 
                    onReplay={handleRegenerateSection}
                    onCopy={handleCopy}
                    onVersionChange={handleVersionChange}
                  />
                ))}
                
                <div ref={outputEndRef} />
              </div>

              {sections.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#eec6c7]/50 to-[#dbd6df]/50 border border-white/40 rounded-2xl flex items-start space-x-3 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-[#db88a4] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-[#64748b] leading-relaxed">
                    <span className="font-bold text-[#334155] font-serif">Lưu ý:</span> Kiểm tra kỹ thông tin nhạy cảm trước khi xuất bản.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
