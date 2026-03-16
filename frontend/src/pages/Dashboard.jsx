import React, { useState } from 'react';
import PromptInput from '../components/PromptInput';
import DashboardGrid from '../components/DashboardGrid';
import ChatPanel from '../components/ChatPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, AlertCircle } from 'lucide-react';
import { dashboardApi } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.generate(prompt);
      if (result.success) {
        setDashboardData(result);
        setIsGenerated(true);
      } else {
        setError(result.error || "Failed to generate dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Connection to backend failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative pb-20">
      <div className="space-y-6">
        <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSkeleton key="skeleton" />
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-red-900">Analysis Failed</h3>
                <p className="text-[13px] text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-[12px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                >
                  Clear Error
                </button>
              </div>
            </motion.div>
          ) : isGenerated && dashboardData ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DashboardGrid isVisible={true} data={dashboardData} />
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
