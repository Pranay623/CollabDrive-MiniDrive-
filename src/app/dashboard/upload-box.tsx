'use client';

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, Zap, X, AlertTriangle, FileText, Pause, Play } from 'lucide-react';

interface UploadItem {
  id: string;
  file: File;
  progress: number; // 0 to 100
  status: 'pending' | 'uploading' | 'paused' | 'complete' | 'error';
  error: string | null;
  // New: Store the interval ID for client-side control
  interval?: NodeJS.Timeout | null; 
}

export default function UploadBox() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploadState = (id: string, update: Partial<Omit<UploadItem, 'id' | 'file'>>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...update } : u));
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploads = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const,
      error: null,
      interval: null,
    }));

    setUploads(prev => [...newUploads, ...prev]);

    // Start the upload for each new file
    newUploads.forEach(upload => startUpload(upload.id, upload.file));
  }, []);

  const clearProgressInterval = (id: string) => {
    const uploadItem = uploads.find(u => u.id === id);
    if (uploadItem && uploadItem.interval) {
        clearInterval(uploadItem.interval);
        setUploadState(id, { interval: null });
    }
  };

  const startProgressSimulation = (id: string) => {
    const interval = setInterval(() => {
        setUploads(prev => prev.map(u => {
            if (u.id === id && u.progress < 95) { // Stop short of 100
                const newProgress = Math.min(u.progress + Math.floor(Math.random() * 5) + 2, 95);
                return { ...u, progress: newProgress };
            }
            return u;
        }));
    }, 300);

    setUploadState(id, { interval });
    return interval;
  };
  
  const startUpload = async (id: string, file: File) => {
    setUploadState(id, { status: 'uploading', error: null });

    // 1. Start simulated progress
    const progressInterval = startProgressSimulation(id);

    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        
        // Check if the upload was paused while the request was in flight
        if (uploads.find(u => u.id === id)?.status === 'paused') {
            // Do not update status, leave it paused, but clear the interval
            clearInterval(progressInterval);
            setUploadState(id, { interval: null });
            return;
        }

        clearInterval(progressInterval); // Clear the simulation interval

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        // 2. Set status to 'complete'
        setUploadState(id, { progress: 100, status: 'complete' as const, interval: null });
        
        console.log(`[UPLOAD COMPLETE]: File ${file.name} uploaded to S3 at key: ${data.key} and saved to DB.`);

    } catch (err: any) {
        clearProgressInterval(id); // Clear interval on error
        const errorMessage = err.message || 'An unknown upload error occurred.';
        setUploadState(id, { status: 'error' as const, error: errorMessage, interval: null });
        console.error('Upload Error:', errorMessage);
    }
  };

  const pauseUpload = (id: string) => {
    clearProgressInterval(id);
    setUploadState(id, { status: 'paused' as const });
    console.log(`[UPLOAD PAUSED]: Upload for ID ${id} is paused.`);
    
    // 🛑 IMPORTANT: In a real S3 chunked upload, you would abort the current chunk upload 
    // and save the current chunk index to your database here.
  };

  const resumeUpload = (id: string, file: File) => {
    // 🛑 IMPORTANT: In a real S3 chunked upload, you would fetch the last chunk index from 
    // your database and restart the S3 upload from that point.

    // Since we're using single-fetch, "resume" means restarting the entire upload
    // which is not true resume, but better UX than forcing a cancellation.
    startUpload(id, file); 
    console.log(`[UPLOAD RESUMED]: Upload for ID ${id} is restarting.`);
  };


  // --- Drag/Drop and Helper Functions (Unchanged) ---

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
      }
  };

  // Helper to format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- JSX (Updated) ---

  return (
    <div className="space-y-4">
      
      {/* 1. Drag & Drop Area */}
      <div 
        className={`p-8 rounded-xl shadow-lg border-2 border-dashed transition duration-300 cursor-pointer text-center 
          ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-blue-300 bg-white hover:border-blue-500'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <p className="text-lg font-semibold text-gray-700">
          {isDragging ? 'Drop files now!' : 'Drag and drop files here to upload'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          The file will be uploaded to S3 and its metadata saved in your database.
        </p>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            onChange={handleFileSelect} 
            className="hidden" 
        />
        
        <button 
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center mx-auto shadow-md"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          <Zap className="w-4 h-4 mr-2" />
          Browse Files
        </button>
      </div>

      {/* 2. Active Uploads/Progress List */}
      {uploads.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Active Uploads ({uploads.length})</h4>
              <div className="space-y-2">
                  {uploads.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-500" />
                          
                          <div className="grow">
                              <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium truncate">{item.file.name}</span>
                                  <span className={`text-xs font-semibold ${item.status === 'complete' ? 'text-green-600' : (item.status === 'error' ? 'text-red-600' : 'text-blue-600')}`}>
                                      {item.status === 'error' ? 'Failed' : `${item.progress}%`}
                                  </span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                      className={`h-1.5 rounded-full ${item.status === 'error' ? 'bg-red-500' : (item.status === 'complete' ? 'bg-green-500' : 'bg-blue-500')}`} 
                                      style={{ width: `${item.progress}%` }}
                                  />
                              </div>
                              
                              {/* Error Message */}
                              {item.error && (
                                  <div className="flex items-center text-xs text-red-500 mt-1">
                                      <AlertTriangle className="w-3 h-3 mr-1" /> {item.error}
                                  </div>
                              )}
                              {/* File Details */}
                              <span className="text-xs text-gray-500 mt-1 block">
                                  Size: {formatSize(item.file.size)} | Status: **{item.status.toUpperCase()}**
                              </span>
                          </div>
                          
                          {/* Control Buttons (Pause/Resume/Cancel) */}
                          {(item.status === 'uploading' || item.status === 'paused') && (
                              <div className="flex space-x-2">
                                  {item.status === 'uploading' ? (
                                      <button 
                                          onClick={() => pauseUpload(item.id)}
                                          className="text-gray-400 hover:text-orange-500 p-1"
                                          title="Pause Upload"
                                      >
                                          <Pause className="w-4 h-4" />
                                      </button>
                                  ) : (
                                      <button 
                                          onClick={() => resumeUpload(item.id, item.file)}
                                          className="text-gray-400 hover:text-green-500 p-1"
                                          title="Resume Upload (Will Restart)"
                                      >
                                          <Play className="w-4 h-4" />
                                      </button>
                                  )}

                                  <button 
                                      onClick={() => { clearProgressInterval(item.id); setUploads(prev => prev.filter(u => u.id !== item.id)); }} 
                                      className="text-gray-400 hover:text-red-500 p-1"
                                      title="Cancel Upload"
                                  >
                                      <X className="w-4 h-4" />
                                  </button>
                              </div>
                          )}

                          {/* Just Cancel button for completed/error items */}
                          {(item.status === 'complete' || item.status === 'error') && (
                              <button 
                                  onClick={() => setUploads(prev => prev.filter(u => u.id !== item.id))} 
                                  className="text-gray-400 hover:text-red-500 p-1"
                                  title="Remove from list"
                              >
                                  <X className="w-4 h-4" />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}