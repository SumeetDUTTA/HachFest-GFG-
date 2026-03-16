import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = ({ isLoading }) => {
  return (
    <header className="h-16 fixed top-0 right-0 left-[220px] bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-30 flex items-center px-6 justify-between">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
           <input 
             type="text" 
             placeholder="Search analytics..." 
             className="w-full bg-[#F3F4F6] border-none rounded-md px-10 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
           />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-[12px] font-medium text-blue-600 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Processing
          </div>
        )}
        
        <button className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-md transition-colors relative">
           <Bell size={18} />
           <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        <div className="w-px h-6 bg-[#E5E7EB]" />

        <div className="flex items-center gap-2 pl-2">
           <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
           </div>
           <div className="hidden lg:block text-left">
              <p className="text-[13px] font-semibold text-[#111827] leading-none">Sahil H.</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Admin</p>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
