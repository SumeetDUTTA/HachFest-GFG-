import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi } from '../services/api';
import { AlertCircle } from 'lucide-react';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) performUpload(droppedFile);
  };

  const performUpload = async (f) => {
    if (!f.name.toLowerCase().endswith('.csv')) {
      setError("Only CSV files are supported currently.");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    try {
      const result = await dashboardApi.uploadCsv(f);
      if (result.success) {
        setFile(f);
        setUploadResult(result);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Connection to backend failed");
    } finally {
      setIsUploading(false);
    }
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
              {isUploading ? 'Refreshing Dataset...' : 'Click or drag CSV to upload'}
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1">Enterprise CSV up to 50MB</p>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                <AlertCircle size={14} />
                <span className="text-[11px] font-medium">{error}</span>
              </div>
            )}
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
                   <span className="text-lg font-bold text-[#111827]">{uploadResult?.row_count?.toLocaleString() || '---'}</span>
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
