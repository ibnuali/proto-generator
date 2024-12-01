'use client';

import React, { useState } from 'react';

export default function ProtoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-proto', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate proto files');
      }

      const result = await response.json();
      setGeneratedFiles(result.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (filename: string) => {
    try {
      const response = await fetch(`/api/download?filename=${encodeURIComponent(filename)}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input 
          type="file" 
          accept=".proto" 
          onChange={handleFileChange}
          className="mb-2"
        />
        <button 
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Proto Files'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {generatedFiles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Files:</h2>
          <ul>
            {generatedFiles.map((filename) => (
              <li key={filename} className="mb-2">
                <button 
                  onClick={() => downloadFile(filename)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Download {filename}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}