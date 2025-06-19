'use client';

import React, { useState, useCallback } from 'react';
import { FileUploadInput } from '../admin/projects/new/FileUploadInput';

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelect = useCallback((file: File) => {
    console.log('🎯 Test page - File selected:', file.name);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Upload Page (No AuthGuard)</h1>
      
      <div style={{ marginTop: '1rem', border: '2px dashed #ccc', padding: '2rem', textAlign: 'center' }}>
        <FileUploadInput onFileSelect={handleFileSelect}>
          <button style={{ padding: '1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Select File
          </button>
        </FileUploadInput>
      </div>

      {selectedFile && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Selected file: {selectedFile.name}</h3>
          {preview && <img src={preview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
        </div>
      )}
    </div>
  );
}
