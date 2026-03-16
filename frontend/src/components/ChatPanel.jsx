import React, { useState } from 'react';
import { SendHorizontal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ messages = [], onSend }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const userPrompt = input.trim();
    if (!userPrompt || !onSend || isSending) return;

    setIsSending(true);
    setInput('');

    try {
      await onSend(userPrompt);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header Info */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Intelligence</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F9FBFF]/50 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale grayscale-0">
               <Sparkles className="text-blue-500 mb-4" size={40} />
               <p className="text-[13px] font-medium text-slate-500">Ask for deeper analysis or chart changes</p>
            </div>
          ) : messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}
            >
              {msg.role === 'system' ? (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl border-2 border-white shadow-md overflow-hidden shrink-0 bg-white">
                  <img src={msg.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil'} alt="User" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ring-1 ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white ring-blue-500 rounded-tr-none' 
                  : 'bg-white border-none text-[#1e293b] ring-slate-100 rounded-tl-none ring-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mx-1 font-semibold uppercase tracking-tighter">
                  {msg.role === 'user' ? 'You' : 'InsightBot'}
                </span>
              </div>
            </motion.div>
          ))}
          {isSending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
               <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <div className="flex gap-1">
                     <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                     <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2 group">
          <input 
            type="text" 
            placeholder="Type a follow-up or refinement..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 h-11 bg-slate-50 border-none rounded-xl pl-4 pr-12 text-[13px] font-medium outline-none focus:bg-white ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-inner"
          />
          <button 
            type="submit"
            disabled={isSending || !input.trim()}
            className="absolute right-1 w-9 h-9 bg-[#3B82F6] text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
