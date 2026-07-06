import api from './api';

export const uploadDocument = async (file: File, options: any, onProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.collectionId) formData.append('collection_id', options.collectionId);
  if (options.language) formData.append('language', options.language);
  if (options.ocrEnabled) formData.append('ocr_enabled', options.ocrEnabled.toString());

  const response = await api.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
  });
  return response.data;
};
