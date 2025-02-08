import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { translations } from './translations';

declare global {
  interface Window {
    api: {
      selectFile: () => Promise<string | null>;
      startEncode: (inputFile: string) => Promise<{ outputFile: string }>;
      setLanguage: (language: 'zh' | 'en') => Promise<void>;
      onProgress: (callback: (progress: any) => void) => void;
    }
  }
}

const App: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

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

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t.title}</h1>
        <button 
          onClick={toggleLanguage}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          {language === 'zh' ? 'English' : '中文'}
        </button>
      </div>
      <div>
        <button 
          onClick={handleFileSelect}
          disabled={isEncoding}
        >
          {t.selectFile}
        </button>
        <button 
          onClick={handleEncode}
          disabled={!selectedFile || isEncoding}
          style={{ marginLeft: '10px' }}
        >
          {t.startEncode}
        </button>
      </div>
      {selectedFile && (
        <p>{t.selectedFile} {selectedFile}</p>
      )}
      {isEncoding && progress && (
        <div className="progress">
          <p>{t.encodeProgress}</p>
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