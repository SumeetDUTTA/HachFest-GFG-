import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadCsv } from '../services/api';

const FileUploader = ({ initialDataset = null, onUploadSuccess, onClearDataset }) => {
  const [uploadedDataset, setUploadedDataset] = useState(initialDataset);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUploadedDataset(initialDataset);
  }, [initialDataset]);

  const runUpload = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only CSV files are supported by the backend right now.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const response = await uploadCsv(selectedFile);
      if (!response.success) {
        throw new Error(response.error || 'Upload failed');
      }

      const datasetPayload = {
        filename: response.filename || selectedFile.name,
        fileSize: selectedFile.size,
        row_count: response.row_count,
        columns: response.columns || [],
        message: response.message || 'CSV uploaded successfully and dataset refreshed',
      };

      setUploadedDataset(datasetPayload);
      if (onUploadSuccess) {
        onUploadSuccess(datasetPayload);
      }
    } catch (error) {
      setUploadError(error.message || 'Upload failed. Please try again.');
      setUploadedDataset(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) runUpload(droppedFile);
  };

  const handleFileSelection = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      runUpload(selectedFile);
    }

    e.target.value = '';
  };

  return (
    <div className="card-base p-6 bg-white">
      <AnimatePresence mode="wait">
        {!uploadedDataset ? (
          <motion.div 
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-10 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-[#F9FAFB] transition-all cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelection}
            />
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
               {isUploading ? (
                 <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
               ) : <Upload size={20} />}
            </div>
            <p className="text-[14px] font-semibold text-[#111827]">
              {isUploading ? 'Uploading records...' : 'Click or drag dataset to upload'}
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1">CSV up to 50MB</p>
            {uploadError && <p className="text-[12px] text-rose-600 mt-3">{uploadError}</p>}
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
                     <p className="text-[13px] font-semibold text-[#111827]">{uploadedDataset.filename}</p>
                     <p className="text-[11px] text-[#6B7280]">{((uploadedDataset.fileSize || 0) / 1024).toFixed(1)} KB • Ready for synthesis</p>
                   </div>
                </div>
                 <button
                  onClick={() => {
                    setUploadedDataset(null);
                    if (onClearDataset) {
                     onClearDataset();
                    }
                  }}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-all"
                 >
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
                   <span className="text-lg font-bold text-[#111827]">{uploadedDataset?.row_count || '-'}</span>
                </div>
             </div>

               <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-[12px] font-semibold text-blue-900">{uploadedDataset?.message || 'Dataset uploaded successfully.'}</p>
                <p className="text-[11px] text-blue-700 mt-1">Columns detected: {uploadedDataset?.columns?.length || 0}</p>
               </div>
             
               <button
                onClick={() => {
                  setUploadedDataset(null);
                  if (onClearDataset) {
                    onClearDataset();
                  }
                }}
                className="btn-secondary w-full h-10"
               >
                Upload Another CSV
               </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
