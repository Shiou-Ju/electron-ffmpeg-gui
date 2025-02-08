import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'))
    .catch(err => {
      console.error('載入頁面失敗：', err);
    });

  // 使用環境變數來判斷是否開啟 DevTools
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // 監聽頁面載入失敗事件
  win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('頁面載入失敗:', errorCode, errorDescription);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 添加 IPC 處理程序
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '選擇要編碼的影片',
    properties: ['openFile'],
    filters: [
      { name: '影片檔案', extensions: ['mp4', 'mov', 'avi', 'mkv'] }
    ]
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  return filePaths[0];
});

ipcMain.handle('start-encode', async (_, inputFile: string) => {
  if (!inputFile) {
    throw new Error('沒有選擇任何檔案');
  }

  const basename = path.basename(inputFile);
  const dirname = path.dirname(inputFile);
  const outputFile = path.join(dirname, `encoded_${basename}`);

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn('ffmpeg', ['-i', inputFile, outputFile]);

    ffmpegProcess.on('error', (err) => {
      reject(`無法執行 ffmpeg，請確認系統中已安裝：${err.message}`);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ outputFile });
      } else {
        reject(`轉檔失敗，ffmpeg 退出代碼：${code}`);
      }
    });
  });
}); 