import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Upload, 
  Lightbulb, 
  Settings, 
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Upload Data', icon: Upload, path: '/upload' },
    { name: 'Insights', icon: Lightbulb, path: '/insights' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-[220px] h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <div className="w-7 h-7 bg-[#3B82F6] rounded-md flex items-center justify-center text-white mr-2 shadow-sm">
          <BarChart3 size={16} />
        </div>
        <span className="text-[15px] font-semibold text-[#111827] tracking-tight">
          InsightBI
        </span>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-6 py-2.5 text-[14px] font-medium transition-colors ${
                isActive 
                ? 'bg-[#EFF6FF] text-[#3B82F6] border-l-[3px] border-[#3B82F6]' 
                : 'text-[#6B7280] hover:bg-[#F9FAF9] hover:text-[#111827] border-l-[3px] border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-semibold text-[#6B7280]">PRO PLAN</span>
            <span className="text-[11px] font-semibold text-[#3B82F6]">82%</span>
          </div>
          <div className="h-1 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#3B82F6] w-[82%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
