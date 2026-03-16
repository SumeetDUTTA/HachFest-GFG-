import React from 'react';
import { History as HistoryIcon, Search, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const archives = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Query History</h1>
          <p className="text-[#6B7280] text-[14px]">Manage and re-run your previous intelligence reports.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 py-1.5 h-9">
           <Search size={14} />
           <span className="text-[13px]">Search reports</span>
        </button>
      </div>

      <div className="card-base overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Query Title</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider text-center">Records</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {archives.map((item, idx) => (
              <tr key={idx} className="h-14 hover:bg-[#F9FAFB] transition-colors cursor-pointer group">
                <td className="px-6 py-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F3F4F6] text-[#6B7280] rounded flex items-center justify-center group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                        <Search size={14} />
                      </div>
                      <span className="text-[14px] font-medium text-[#111827]">{item.query}</span>
                   </div>
                </td>
                <td className="px-6 py-3 text-[14px] text-[#6B7280]">{item.date}</td>
                <td className="px-6 py-3 text-[14px] text-[#6B7280] text-center">{item.records}</td>
                <td className="px-6 py-3 text-center">
                   <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                     item.status === 'Rendered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                   }`}>
                      {item.status}
                   </span>
                </td>
                <td className="px-6 py-3 text-right">
                   <button className="text-[13px] font-semibold text-[#3B82F6] hover:text-[#2563eb] h-8 px-3 rounded-md hover:bg-blue-50 transition-colors">
                      Re-run
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
