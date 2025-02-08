import React, { useState } from 'react';

declare global {
  interface Window {
    api: {
      selectFile: () => Promise<string | null>;
      startEncode: (inputFile: string) => Promise<{ outputFile: string }>;
    }
  }
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isEncoding, setIsEncoding] = useState(false);

  const handleFileSelect = async () => {
    try {
      const filePath = await window.api.selectFile();
      if (filePath) {
        setSelectedFile(filePath);
        setStatus('');
      }
    } catch (err) {
      setStatus(`選擇檔案時發生錯誤：${err}`);
    }
  };

  const handleEncode = async () => {
    if (!selectedFile) {
      setStatus('請先選擇檔案');
      return;
    }

    setIsEncoding(true);
    setStatus('轉檔中...');

    try {
      const { outputFile } = await window.api.startEncode(selectedFile);
      setStatus(`轉檔完成！輸出：${outputFile}`);
    } catch (err) {
      setStatus(`轉檔失敗：${err}`);
    } finally {
      setIsEncoding(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>FFmpeg GUI</h1>
      <div>
        <button 
          onClick={handleFileSelect}
          disabled={isEncoding}
        >
          選擇檔案
        </button>
        <button 
          onClick={handleEncode}
          disabled={!selectedFile || isEncoding}
          style={{ marginLeft: '10px' }}
        >
          開始轉檔
        </button>
      </div>
      {selectedFile && (
        <p>已選擇：{selectedFile}</p>
      )}
      {status && (
        <p style={{ 
          color: status.includes('失敗') ? 'red' : 
                 status.includes('完成') ? 'green' : 
                 'inherit' 
        }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default App; 