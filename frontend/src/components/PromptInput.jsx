import React, { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

const PromptInput = ({ onGenerate, isLoading, isDataLoaded }) => {
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDataLoaded && input.trim() && !isLoading) onGenerate(input.trim());
  };

  const isDisabled = isLoading || !isDataLoaded;

  return (
    <div className="w-full card-base p-6 mb-8 relative">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
          <Sparkles size={12} />
        </div>
        <span className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Business Intelligence Assistant</span>
      </div>

      <div 
        className="relative group"
        onMouseEnter={() => !isDataLoaded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isDisabled}
            placeholder={isDataLoaded ? "What insights are you looking for today? e.g. 'Show me monthly revenue...'" : "Please upload a CSV file first to start analysis"}
            className={`w-full h-12 rounded-lg pl-5 pr-32 text-[14px] outline-none transition-all shadow-inner border ${
              !isDataLoaded 
                ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400' 
                : 'bg-[#F9FAFB] border-[#E5E7EB] focus:ring-1 focus:ring-blue-400 focus:bg-white'
            }`}
          />
          <button 
            type="submit"
            disabled={isDisabled || !input.trim()}
            className="absolute right-1.5 top-1.5 h-9 px-4 bg-[#3B82F6] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Wand2 size={14} />}
            Generate
          </button>
        </form>

        {showTooltip && !isDataLoaded && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
            ⚠️ PLEASE UPLOAD CSV FIRST
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptInput;
