import React from 'react';
import { DragDropUploader } from '../components/upload/DragDropUploader';
import { CollectionManager } from '../components/collections/CollectionManager';
import { motion } from 'framer-motion';

export const UploadPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mt-2">
          Upload your files to begin indexing them for the AI Knowledge Assistant. 
          Supported files will be processed, chunked, and embedded into the vector database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border-r border-gray-200 pr-8">
          <CollectionManager />
        </div>
        
        <div className="lg:col-span-2">
          <DragDropUploader />
        </div>
      </div>
    </motion.div>
  );
};
