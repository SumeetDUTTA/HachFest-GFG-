import React from 'react';
import FileUploader from '../components/FileUploader';
import { Database, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadData = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Data Corpus</h1>
          <p className="text-[#6B7280] text-[14px]">Connect and manage your enterprise datasets.</p>
        </div>
      </div>

      <FileUploader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
             <Database size={18} />
          </div>
          <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Multi-Source Support</h3>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">Connect SQL, NoSQL or flat files instantly with our adapter engine.</p>
        </div>
        <div className="card-base p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
             <ShieldCheck size={18} />
          </div>
          <h3 className="text-[14px] font-semibold text-[#111827] mb-2">SOC-2 Secure</h3>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">Enterprise-grade encryption and PII protection for all vaults.</p>
        </div>
        <div className="card-base p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
             <Zap size={18} />
          </div>
          <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Instant Indexing</h3>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">Auto-mapping of schema and relationships via LLM pipeline.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadData;
