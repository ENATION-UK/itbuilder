const { app,ipcMain, BrowserWindow } = require('electron');

const path = require('path');
const fs = require('fs');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 可选，预加载文件
      nodeIntegration: true, // 可视需求调整
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3001'); // Vite 开发服务器地址
    mainWindow.webContents.openDevTools(); // 打开开发者工具
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



// 获取 app 目录
ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// 获取 userData 目录
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// 读取 __dirname 下的文件
ipcMain.handle('read-app-file', async (event, filePath) => {
  try {
    const appPath = app.getAppPath();
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
    const appPath = app.getAppPath();
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