import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) simulateUpload(droppedFile);
  };

  const simulateUpload = (f) => {
    setIsUploading(true);
    setTimeout(() => {
      setFile(f);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="card-base p-6 bg-white">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div 
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-10 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-[#F9FAFB] transition-all cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
               {isUploading ? (
                 <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
               ) : <Upload size={20} />}
            </div>
            <p className="text-[14px] font-semibold text-[#111827]">
              {isUploading ? 'Uploading records...' : 'Click or drag dataset to upload'}
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1">CSV, XLSX or JSON up to 50MB</p>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
             <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center">
                      <FileText size={18} />
                   </div>
                   <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{file.name}</p>
                      <p className="text-[11px] text-[#6B7280]">{(file.size / 1024).toFixed(1)} KB • Ready for synthesis</p>
                   </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-all">
                   <X size={16} />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-lg">
                   <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Health Score</p>
                   <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#111827]">98/100</span>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                   </div>
                </div>
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-lg">
                   <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Row Count</p>
                   <span className="text-lg font-bold text-[#111827]">~24,500</span>
                </div>
             </div>
             
             <button className="btn-primary w-full h-10">Process & Sync Dataset</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
