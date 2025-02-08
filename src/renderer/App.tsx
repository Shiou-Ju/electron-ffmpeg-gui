import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    api: {
      selectFile: () => Promise<string | null>;
      startEncode: (inputFile: string) => Promise<{ outputFile: string }>;
      onProgress: (callback: (progress: any) => void) => void;
    }
  }
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    window.api.onProgress((data) => {
      setProgress(data.output);
    });
  }, []);

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
      {isEncoding && progress && (
        <div className="progress">
          <p>轉檔進度：</p>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {progress}
          </pre>
        </div>
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