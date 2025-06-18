'use client';

import React, { useRef, useCallback } from 'react';

interface FileUploadInputProps {
  onFileSelect?: (file: File) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  children: React.ReactNode;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  onFileSelect,
  onMultipleFilesSelect,
  accept = "image/*",
  multiple = false,
  children
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 FileUploadInput onChange triggered');
    
    const files = Array.from(event.target.files || []);
    console.log('📁 Files selected:', files.length);
      if (files.length > 0) {
      if (multiple && onMultipleFilesSelect) {
        console.log('📎 Processing multiple files');
        onMultipleFilesSelect(files);
      } else if (!multiple && onFileSelect) {
        console.log('📎 Processing single file:', files[0].name);
        onFileSelect(files[0]);
      }
    }
    
    // Reset input
    event.target.value = '';
    console.log('🧹 Input reset');
  }, [onFileSelect, onMultipleFilesSelect, multiple]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'block'
      }}
    >
      {children}
      <input
        ref={inputRef}
        type="file"        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer'
        }}
      />
    </div>
  );
};
