import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import ffmpeg from 'ffmpeg-static';

let mainWindow: BrowserWindow | null = null;
let language: 'zh' | 'en' = 'zh';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
    .catch(err => {
      console.error('載入頁面失敗：', err);
    });

  // 使用環境變數來判斷是否開啟 DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 監聽頁面載入失敗事件
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
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
  const basename = path.basename(inputFile);
  const dirname = path.dirname(inputFile);
  const outputFile = path.join(dirname, `encoded_${basename}`);

  // 檢查檔案是否存在
  if (fs.existsSync(outputFile)) {
    const dialogButtons = language === 'zh' 
      ? ['覆蓋', '取消']
      : ['Overwrite', 'Cancel'];
    
    const dialogTitle = language === 'zh'
      ? '檔案已存在'
      : 'File Exists';
    
    const dialogMessage = language === 'zh'
      ? '輸出檔案已存在，是否要覆蓋？'
      : 'Output file already exists. Do you want to overwrite it?';

    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: dialogButtons,
      defaultId: 1,
      title: dialogTitle,
      message: dialogMessage,
      detail: outputFile
    });

    if (response === 1) {
      const cancelMessage = language === 'zh'
        ? '使用者取消操作'
        : 'Operation cancelled by user';
      throw new Error(cancelMessage);
    }

    try {
      fs.unlinkSync(outputFile);
    } catch (err) {
      const errorMessage = language === 'zh'
        ? `無法刪除現有檔案：${err}`
        : `Cannot delete existing file: ${err}`;
      throw new Error(errorMessage);
    }
  }

  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      reject(new Error(language === 'zh' 
        ? 'ffmpeg-static 未正確安裝' 
        : 'ffmpeg-static is not properly installed'));
      return;
    }

    // 在開發環境和生產環境中處理 ffmpeg 路徑
    let ffmpegPath = ffmpeg;
    if (app.isPackaged) {
      // 在打包的應用程式中，使用相對於應用程式的路徑
      ffmpegPath = path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'ffmpeg-static',
        ffmpeg.split('node_modules/ffmpeg-static/')[1]
      );
    }

    console.log('Using ffmpeg path:', ffmpegPath);

    if (!fs.existsSync(ffmpegPath)) {
      reject(new Error(language === 'zh'
        ? `找不到 ffmpeg 執行檔：${ffmpegPath}`
        : `Cannot find ffmpeg executable: ${ffmpegPath}`));
      return;
    }

    const ffmpegProcess: ChildProcess = spawn(ffmpegPath, ['-i', inputFile, '-y', outputFile]);

    if (!ffmpegProcess.stderr) {
      reject(new Error('Failed to start ffmpeg process'));
      return;
    }

    ffmpegProcess.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}.\d{2})/);
      if (timeMatch) {
        const [_, hours, minutes, seconds] = timeMatch;
        const currentTime = parseFloat(hours) * 3600 + 
                          parseFloat(minutes) * 60 + 
                          parseFloat(seconds);
        
        if (mainWindow) {
          mainWindow.webContents.send('encode-progress', {
            currentTime,
            output
          });
        }
      }
    });

    ffmpegProcess.on('error', (err: Error) => {
      const errorMessage = language === 'zh' 
        ? `無法執行 ffmpeg：${err.message}`
        : `Cannot execute ffmpeg: ${err.message}`;
      reject(errorMessage);
    });

    ffmpegProcess.on('close', (code: number | null) => {
      if (code === 0) {
        resolve({ outputFile });
      } else {
        const errorMessage = language === 'zh'
          ? `轉檔失敗，ffmpeg 退出代碼：${code}`
          : `Encoding failed, ffmpeg exit code: ${code}`;
        reject(errorMessage);
      }
    });
  });
});

ipcMain.handle('set-language', (_, newLanguage: 'zh' | 'en') => {
  language = newLanguage;
}); 