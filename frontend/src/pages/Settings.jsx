import React from 'react';
import { User, Shield, Bell, Database, Globe, ChevronRight, LogOut, CreditCard, Code, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const sections = [
    { icon: User, title: 'Profile Account', desc: 'Avatar, personal info and bio.' },
    { icon: CreditCard, title: 'Billing & Plans', desc: 'Manage invoices and active tiers.' },
    { icon: Shield, title: 'Security', desc: 'SSO, MFA and vault keys.' },
    { icon: Bell, title: 'Notifications', desc: 'Alert thresholds and routing.' },
    { icon: Database, title: 'DB Ingestion', desc: 'Cloud SQL / S3 connectivity.' },
    { icon: Globe, title: 'Compliance', desc: 'SOC2 / GDPR localization.' },
    { icon: Code, title: 'Developers', desc: 'API keys and webhooks.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Systems Config</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-500 rounded-md text-[13px] font-semibold hover:bg-rose-50 transition-colors">
           <LogOut size={16} />
           Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Compact Profile Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="card-base p-6 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#EFF6FF] mx-auto overflow-hidden mb-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111827]">Sahil H.</h3>
              <p className="text-[12px] text-[#6B7280] font-medium uppercase tracking-wider">Enterprise Lead</p>
              <div className="mt-6 flex flex-col gap-2">
                 <button className="btn-primary w-full text-[13px] h-9 flex items-center justify-center">Update Avatar</button>
                 <button className="btn-secondary w-full text-[13px] h-9">Edit Profile</button>
              </div>
           </div>

           <div className="bg-[#3B82F6] p-5 rounded-xl text-white shadow-md relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="text-[14px] font-semibold mb-1 flex items-center gap-2">
                    <Activity size={16} />
                    Full Support
                 </h4>
                 <p className="text-[12px] text-white/90 leading-snug mb-3">Priority 24/7 dedicated support active.</p>
                 <button className="text-[11px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-all">
                    Open Ticket
                 </button>
              </div>
              <Activity size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
           </div>
        </div>

        {/* Right: Settings List */}
        <div className="lg:col-span-8">
           <div className="card-base overflow-hidden">
              <div className="divide-y divide-[#E5E7EB]">
                {sections.map((item, idx) => (
                  <div key={idx} className="h-16 px-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-[#F3F4F6] text-[#6B7280] rounded-lg flex items-center justify-center group-hover:bg-[#EFF6FF] group-hover:text-[#3B82F6] transition-colors">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-semibold text-[#111827]">{item.title}</h4>
                        <p className="text-[12px] text-[#6B7280]">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors" />
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
