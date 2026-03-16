import React, { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

const PromptInput = ({ onGenerate, isLoading }) => {
  const [input, setInput] = useState('');

  const suggestions = [
    "Regional sales breakdown",
    "Customer churn Q3",
    "Inventory health map"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) onGenerate(input.trim());
  };

  return (
    <div className="w-full card-base p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
          <Sparkles size={12} />
        </div>
        <span className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Business Intelligence Assistant</span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What insights are you looking for today? e.g. 'Show me monthly revenue...'"
          className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-5 pr-32 text-[14px] outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all shadow-inner"
        />
        <button 
          disabled={isLoading || !input.trim()}
          className="absolute right-1.5 top-1.5 h-9 px-4 bg-[#3B82F6] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Wand2 size={14} />}
          Generate
        </button>
      </form>

      <div className="flex items-center gap-4 mt-4">
        <span className="text-[12px] font-medium text-[#9CA3AF]">Suggestions:</span>
        <div className="flex gap-2">
          {suggestions.map((s) => (
            <button 
              key={s} 
              type="button"
              disabled={isLoading}
              onClick={() => {
                setInput(s);
                onGenerate(s);
              }}
              className="px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-[12px] text-[#6B7280] font-medium hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
