import React, { useState } from 'react';
import { SendHorizontal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi } from '../services/api';

const ChatPanel = ({ isDrawer }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'I am your BI assistant. How can I help you refine this analysis?', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = { role: 'user', content: input, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await dashboardApi.refine(input);
      if (result.success) {
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: result.insights || 'Analysis updated successfully.', 
          type: 'text' 
        }]);
        // Note: In a real app, we would use a Global State or Context to update the dashboard grid
        // For now, we'll assume the user sees the insights here
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${result.error}`, type: 'text' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error. Please try again.', type: 'text' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {msg.role === 'system' && (
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white shrink-0 mt-1">
                  <Sparkles size={12} />
                </div>
              )}
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[13px] font-medium ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-[#E5E7EB] text-[#111827] shadow-sm'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full border border-slate-200 overflow-hidden shrink-0 mt-1">
                  <img src={msg.avatar} alt="User" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-[#E5E7EB] flex items-center gap-2 bg-white">
        <input 
          type="text" 
          placeholder="Type a follow-up..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-9 bg-[#F9FAFB] border border-[#E5E7EB] rounded px-3 text-[13px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-all"
        />
        <button 
          type="submit"
          className="h-9 w-9 bg-[#3B82F6] text-white rounded flex items-center justify-center hover:bg-blue-600 transition-all shadow-sm"
        >
          <SendHorizontal size={14} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
