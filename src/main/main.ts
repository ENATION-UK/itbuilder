import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function getAppPath() {
  const appPath = app.getAppPath();
  if (process.env.NODE_ENV === 'development') {
    return appPath;
  }else {

    // 去掉 app.asar 部分
      // 如果没有 app.asar 部分，直接使用 appPath
    return appPath.includes('app.asar')
        ? appPath.substring(0, appPath.indexOf('app.asar'))
        : appPath;
  }

}
// 获取 app 目录
ipcMain.handle('get-app-path', () => {
  return getAppPath();
});



// 获取 userData 目录
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// 读取 __dirname 下的文件
ipcMain.handle('read-app-file', async (event, filePath) => {
  try {
    const appPath = getAppPath();
    const fullPath = path.join(appPath, filePath);
    return fs.promises.readFile(fullPath, 'utf-8');
  } catch (error) {
    console.error('读取应用目录文件失败:', error);
    throw error;
  }
});

// 写入 __dirname 下的文件
ipcMain.handle('write-app-file', async (event, filePath, content) => {
  try {
    const appPath = getAppPath();
    const fullPath = path.join(appPath, filePath);
    await fs.promises.writeFile(fullPath, content, 'utf-8');
    return '写入成功';
  } catch (error) {
    console.error('写入应用目录文件失败:', error);
    throw error;
  }
});

// 读取 userData 目录下的文件
ipcMain.handle('read-user-file', async (event, filePath) => {
  try {
    const userDataPath = app.getPath('userData');
    const fullPath = path.join(userDataPath, 'project', filePath);
    return fs.promises.readFile(fullPath, 'utf-8');
  } catch (error) {
    console.error('读取 userData 目录文件失败:', error);
    throw error;
  }
});

// 写入 userData 目录下的文件
ipcMain.handle('write-user-file', async (event, filePath, content) => {
  try {
    const userDataPath = app.getPath('userData');
    const fullPath = path.join(userDataPath, 'project', filePath);
    // 确保目录存在
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true });

    await fs.promises.writeFile(fullPath, content, 'utf-8');
    return '写入成功';
  } catch (error) {
    console.error('写入 userData 目录文件失败:', error);
    throw error;
  }
});


// 判断文件是否存在
ipcMain.handle('user-file-exists', async (event, filePath) => {
  try {
    const userDataPath = app.getPath('userData');
    const fullPath = path.join(userDataPath, 'project', filePath);
    return fs.promises.access(fullPath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
  } catch (error) {
    console.error('检查文件是否存在失败:', error);
    return false;
  }
});