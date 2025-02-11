// TODO: not used now
export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    title: 'FFmpeg 影片轉檔工具',
    selectFile: '選擇檔案',
    startEncode: '開始轉檔',
    selectedFile: '已選擇檔案：',
    encodeProgress: '轉檔進度：',
    pleaseSelectFile: '請先選擇檔案',
    encoding: '轉檔中...',
    encodingComplete: '轉檔完成！輸出檔案：',
    encodingFailed: '轉檔失敗：',
    fileSelectError: '選擇檔案時發生錯誤：',
    fileExists: '輸出檔案已存在，是否要覆蓋？',
    overwrite: '覆蓋',
    cancel: '取消',
    fileExistsTitle: '檔案已存在',
    userCancelled: '使用者取消操作',
    deleteError: '無法刪除現有檔案：',
    ffmpegError: '無法執行 ffmpeg，請確認系統中已安裝：',
    encodeError: '轉檔失敗，ffmpeg 退出代碼：'
  },
  en: {
    title: 'FFmpeg Video Converter',
    selectFile: 'Select File',
    startEncode: 'Start Encode',
    selectedFile: 'Selected file: ',
    encodeProgress: 'Encoding Progress:',
    pleaseSelectFile: 'Please select a file first',
    encoding: 'Encoding...',
    encodingComplete: 'Encoding complete! Output file: ',
    encodingFailed: 'Encoding failed: ',
    fileSelectError: 'Error selecting file: ',
    fileExists: 'Output file already exists. Do you want to overwrite it?',
    overwrite: 'Overwrite',
    cancel: 'Cancel',
    fileExistsTitle: 'File Exists',
    userCancelled: 'Operation cancelled by user',
    deleteError: 'Cannot delete existing file: ',
    ffmpegError: 'Cannot execute ffmpeg, please make sure it is installed: ',
    encodeError: 'Encoding failed, ffmpeg exit code: '
  }
}; 