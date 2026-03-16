import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KpiCard = ({ title, value, subValue, trend, isUp, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card-base p-4 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 bg-blue-50 text-[#3B82F6] rounded-md flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
           <h2 className="text-[20px] font-bold text-[#111827] leading-none">{value}</h2>
           {subValue && <span className="text-[11px] text-[#6B7280] font-medium mt-1 block">{subValue}</span>}
        </div>
        {trend && (
           <div className={`flex items-center gap-0.5 text-[12px] font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
             {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
             {trend}
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default KpiCard;
