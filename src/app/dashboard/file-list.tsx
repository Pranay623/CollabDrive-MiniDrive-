'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Image, Code, Folder, Settings, Trash2, Download, Search, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FileItem {
  id: string;
  name: string;
  mimeType: string | null;
  size: number;
  version: number;
  createdAt: string;
}

const fileTypeMap: { [key: string]: { icon: React.ElementType, color: string } } = {
  'application/pdf': { icon: FileText, color: 'text-red-500' },
  'image/': { icon: Image, color: 'text-green-500' },
  'text/': { icon: Code, color: 'text-blue-500' },
  'folder': { icon: Folder, color: 'text-yellow-600' },
};

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/files/list');
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

   

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/download?id=${fileId}`);
      if (!res.ok) throw new Error('Failed to get download URL');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      if (!confirm("Delete this file? This action cannot be undone.")) return;
      const res = await fetch(`/api/files/delete?id=${fileId}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete file');
      }
      // Refresh the list after successful deletion
      await fetchFiles();
    } catch (err) {
      console.error('Failed to delete file', err);
      // Minimal user feedback — keep it simple for now
      alert('Could not delete file. See console for details.');
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Search + Refresh */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <div className="relative grow">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <button
          onClick={fetchFiles}
          className="p-2 text-gray-600 hover:text-blue-600 rounded-full transition hover:bg-gray-100"
          title="Refresh Files"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-10 text-center text-gray-500 flex flex-col items-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
          Fetching latest files from CollabDrive...
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 hidden sm:block">Type</div>
            <div className="col-span-2 hidden md:block">Size</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* File Rows */}
          <div className="divide-y divide-gray-100">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => {
                const fileType =
                  Object.keys(fileTypeMap).find(type =>
                    file.mimeType?.startsWith(type)
                  ) || 'application/pdf';
                const { icon: Icon, color } = fileTypeMap[fileType] || fileTypeMap['application/pdf'];
                return (
                  <div key={file.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition items-center">
                    <Link
                      href={`/dashboard/preview/${file.id}`}
                      className="col-span-5 flex items-center space-x-3 truncate hover:underline"
                    >
                      <Icon className={`w-5 h-5 ${color} shrink-0`} />
                      <span className="font-medium text-gray-800 truncate">
                        {file.name}
                      </span>
                    </Link>

                    <div className="col-span-2 text-sm text-gray-600 hidden sm:block">
                      {file.mimeType || 'Unknown'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 hidden md:block">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                    <div className="col-span-3 flex justify-end items-center space-x-3">
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="text-gray-400 hover:text-green-500 p-1 rounded-full hover:bg-gray-200 transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-gray-500">
                No files found matching "{searchTerm}".
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
