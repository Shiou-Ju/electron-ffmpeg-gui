import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded');

// 在這裡定義安全的 API
contextBridge.exposeInMainWorld('api', {
  selectFile: () => {
    console.log('selectFile called');
    return ipcRenderer.invoke('open-file-dialog');
  },
  startEncode: (inputFile: string) => {
    console.log('startEncode called');
    return ipcRenderer.invoke('start-encode', inputFile);
  },
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('encode-progress', (_, data) => callback(data));
  }
});
