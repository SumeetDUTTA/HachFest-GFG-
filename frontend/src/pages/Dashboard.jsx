import React, { useState } from 'react';
import PromptInput from '../components/PromptInput';
import DashboardGrid from '../components/DashboardGrid';
import ChatPanel from '../components/ChatPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const Dashboard = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleGenerate = (prompt) => {
    setIsGenerated(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
    }, 1200);
  };

  return (
    <div className="relative pb-20">
      <div className="space-y-6">
        <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSkeleton key="skeleton" />
          ) : isGenerated ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DashboardGrid isVisible={true} />
            </motion.div>
          ) : (
            <div key="placeholder" className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-2xl bg-white/50">
               <div className="w-12 h-12 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={24} />
               </div>
               <p className="text-[15px] font-semibold text-[#111827]">Welcome back, Sahil</p>
               <p className="text-[13px] text-[#6B7280] mt-1">Enter a query above to synthesize a new analytical dashboard.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Bubble - More Subtle */}
      {isGenerated && !isLoading && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#3B82F6] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all z-50 hover:scale-110 active:scale-95 group"
        >
          <MessageCircle size={22} />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">Open Assistant</span>
        </button>
      )}

      {/* Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="h-16 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
                 <span className="text-[13px] font-bold text-[#111827] uppercase tracking-widest">Interactive Assistant</span>
                 <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-200 rounded-md text-slate-400"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                 <ChatPanel isDrawer={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
