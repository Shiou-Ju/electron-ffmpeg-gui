import { contextBridge } from 'electron';

// 在這裡定義安全的 API
contextBridge.exposeInMainWorld('api', {
  // 之後可以添加 FFmpeg 相關的功能
});
