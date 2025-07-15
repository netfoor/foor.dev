'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';
import { Upload, FileX } from 'lucide-react';

// Styled component for the file input
const fileInputStyles = `
  .file-upload-container {
    width: 100%;
  }
  
  .file-upload-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background-color: var(--amplify-colors-background-secondary);
    border: 1px dashed var(--amplify-colors-border-secondary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .file-upload-button:hover {
    background-color: var(--amplify-colors-background-tertiary);
    border-color: var(--amplify-colors-border-hover);
  }
  
  .file-input {
    display: none;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    margin-top: 8px;
    padding: 8px;
    background-color: var(--amplify-colors-background-secondary);
    border-radius: 6px;
    font-size: 0.9rem;
  }
  
  .file-name {
    flex-grow: 1;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .clear-button {
    margin-left: 8px;
    cursor: pointer;
    color: var(--amplify-colors-font-secondary);
  }
  
  .clear-button:hover {
    color: var(--amplify-colors-font-primary);
  }
`;

interface FileUploadInputProps {
  id: string;
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  id,
  label = 'Upload File',
  accept = '*/*',
  onChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onChange(file);
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);
  
  return (
    <div className="file-upload-container">
      <style>{fileInputStyles}</style>
      
      <div className="file-upload-button" onClick={handleButtonClick}>
        <Upload size={16} />
        <Text>{label}</Text>
      </div>
      
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        className="file-input"
        accept={accept}
        onChange={handleFileChange}
      />
      
      {selectedFile && (
        <div className="file-info">
          <Text className="file-name">{selectedFile.name}</Text>
          <div className="clear-button" onClick={clearSelection}>
            <FileX size={16} />
          </div>
        </div>
      )}
    </div>
  );
};
