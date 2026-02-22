import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-stone max-w-none 
      prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#334155] 
      prose-p:text-[#334155] prose-p:leading-relaxed prose-p:font-light prose-p:mb-6 prose-p:text-justify
      prose-li:text-[#334155] prose-li:text-justify
      prose-strong:font-bold prose-strong:text-[#1e293b]
      prose-a:text-[#738fbd] prose-a:no-underline hover:prose-a:underline
      prose-th:text-[#64748b] prose-th:font-serif prose-th:tracking-wider
      prose-hr:border-none prose-hr:my-8 prose-hr:bg-[#a8c3d4]/40 prose-hr:h-[1.5px]
    ">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 border border-white/60 rounded-xl shadow-sm bg-white/40 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-white/60" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-[#eec6c7]/30" {...props} />,
          th: ({node, ...props}) => <th className="px-5 py-3 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-widest" {...props} />,
          td: ({node, ...props}) => <td className="px-5 py-3 whitespace-pre-wrap text-sm text-[#334155] border-t border-white/40" {...props} />,
          
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-4 space-y-2 marker:text-[#db88a4]" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-4 space-y-2 marker:text-[#64748b] marker:font-bold" {...props} />,
          
          blockquote: ({node, ...props}) => (
             <div className="border-l-[3px] border-[#738fbd]/50 pl-4 py-1 my-6 italic text-[#64748b] bg-white/20 rounded-r-lg">
               {props.children}
             </div>
          ),
          // Custom Highlighter Style for 'Code' syntax (Backticks)
          code: ({node, className, children, ...props}) => (
            <span 
              className="font-sans font-medium text-[#334155] border-b-[2px] border-[#738fbd] bg-[#738fbd]/20 px-1 rounded-sm mx-0.5" 
              {...props}
            >
              {children}
            </span>
          ),
          a: ({node, ...props}) => <a className="text-[#738fbd] no-underline hover:underline" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;