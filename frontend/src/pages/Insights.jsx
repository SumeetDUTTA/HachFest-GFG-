import React from 'react';
import { Lightbulb, TrendingUp, Target, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Insights = () => {
  const data = [
    { 
      icon: TrendingUp, 
      color: 'blue', 
      title: 'Revenue Optimization', 
      desc: 'Suggest 15% pricing increase on Cloud Suite X for $40k MRR boost.',
      impact: '+$40k/mo',
      tag: 'Strategic'
    },
    { 
      icon: Target, 
      color: 'emerald', 
      title: 'Market Expansion', 
      desc: 'Tier 2 cities show 3x more efficiency than Tier 1 in current LTV.',
      impact: '3x ROI',
      tag: 'Growth'
    },
    { 
      icon: Users, 
      color: 'amber', 
      title: 'Segment Discovery', 
      desc: 'Identified high-value segment: Executive 35-45 with 80% higher LTV.',
      impact: '+80% LTV',
      tag: 'Audience'
    },
    { 
      icon: Lightbulb, 
      color: 'indigo', 
      title: 'Efficiency Gain', 
      desc: 'Consolidating logistics in East reduces operational costs by 12%.',
      impact: '-12% Cost',
      tag: 'Ops'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Strategic Insights</h1>
          <p className="text-[#6B7280] text-[14px]">AI-generated recommendations based on behavioral patterns.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-[#E5E7EB] shadow-sm">
           <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Confidence</p>
           <p className="text-lg font-bold text-[#3B82F6]">94.8%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-base p-5 h-[160px] flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`w-10 h-10 bg-blue-50 text-[#3B82F6] rounded-lg flex items-center justify-center`}>
                  <item.icon size={20} />
                </div>
                <div>
                   <h3 className="text-[15px] font-semibold text-[#111827]">{item.title}</h3>
                   <p className="text-[13px] text-[#6B7280] line-clamp-2 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <span className="text-[14px] font-bold text-[#3B82F6]">{item.impact}</span>
            </div>

            <div className="flex items-center justify-between mt-4">
               <span className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-md text-[11px] font-medium">{item.tag}</span>
               <button className="flex items-center gap-1 text-[13px] font-semibold text-[#3B82F6] hover:underline">
                  Analyze
                  <ArrowUpRight size={14} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Insights;
