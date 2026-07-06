import React, { useCallback, useState } from 'react';
import { uploadDocument } from '../../services/document.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const DragDropUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{file: File, progress: number}[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(uploadFile);
  };

  const uploadFile = async (file: File) => {
    setUploadingFiles(prev => [...prev, { file, progress: 0 }]);
    
    try {
      await uploadDocument(file, { ocrEnabled: false }, (progressEvent) => {
        const progress = progressEvent.total 
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
          : 0;
          
        setUploadingFiles(prev => 
          prev.map(item => item.file.name === file.name ? { ...item, progress } : item)
        );
      });
      toast.success(`${file.name} uploaded successfully!`);
      // Remove from list after short delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(item => item.file.name !== file.name));
      }, 2000);
    } catch (error) {
      toast.error(`Failed to upload ${file.name}`);
      setUploadingFiles(prev => prev.filter(item => item.file.name !== file.name));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Drag and drop or click to upload files"
        />
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-gray-700">Drag & drop files here</p>
        <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
        <p className="text-xs text-gray-400 mt-4">Supported: PDF, DOCX, TXT, CSV, PPTX, MD, PNG, JPEG, ZIP</p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Uploading Files</h3>
          {uploadingFiles.map((item, idx) => (
            <motion.div 
              key={`${item.file.name}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 truncate max-w-[80%]">{item.file.name}</span>
                <span className="text-blue-600">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
