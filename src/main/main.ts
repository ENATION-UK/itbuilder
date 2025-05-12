import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "fs";
import {spawn} from "child_process";
import './hnswlib-service';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 950,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // 设置窗口最大化
    mainWindow.maximize();

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/index.html`));
    }

    // 在窗口加载完后调用渲染进程的方法，加载用户设置
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('app-on-load');
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(createWindow);

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
    } else {

        // 去掉 app.asar 部分
        // 如果没有 app.asar 部分，直接使用 appPath
        return appPath.includes('app.asar')
            ? appPath.substring(0, appPath.indexOf('app.asar'))
            : appPath;
    }

}

ipcMain.handle('path-join', (_, ...args) => {
    return path.join(...args);
});

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

// 读取文件
ipcMain.handle('read-file', async (event, fullPath) => {
    try {
        return fs.promises.readFile(fullPath, 'utf-8');
    } catch (error) {
        console.error('读取文件失败:', error);
        throw error;
    }
});


// 写入文件
ipcMain.handle('write-file', async (event, fullPath, content) => {
    try {
        const dir = path.dirname(fullPath);

        // 确保目录存在
        await fs.promises.mkdir(dir, { recursive: true });

        await fs.promises.writeFile(fullPath, content, 'utf-8');

    } catch (error) {
        console.error('写入文件失败:', error);
        throw error;
    }
});


// 读取 userData 目录下的文件
ipcMain.handle('read-user-file', async (event, filePath) => {
    try {
        const userDataPath = app.getPath('userData');
        const fullPath =path.join(userDataPath, 'Projects', filePath);
        return fs.promises.readFile(fullPath, 'utf-8');
    } catch (error) {
        console.error('读取 user文件失败:', error);
        throw error;
    }
});

// 创建 userData 目录
ipcMain.handle('create-user-folder', async (event, folderPath) => {
    try {
        const userDataPath = app.getPath('userData');
        const fullPath = path.join(userDataPath, 'Projects', folderPath);
        // 确保目录存在
         await fs.promises.mkdir(fullPath, {recursive: true});
        console.log('创建成功:' + fullPath);
        return '创建成功';
    } catch (error) {
        console.error('创建userData 目录失败:', error);
        throw error;
    }
});


// 写入 userData 目录下的文件
ipcMain.handle('write-user-file', async (event, filePath, content) => {
    try {
        const userDataPath = app.getPath('userData');
        const fullPath = path.join(userDataPath, 'Projects', filePath);
        // 确保目录存在
        const dir = path.dirname(fullPath);
        await fs.promises.mkdir(dir, {recursive: true});

        await fs.promises.writeFile(fullPath, content, 'utf-8');
        return '写入成功';
    } catch (error) {
        console.error('写入 userData 目录文件失败:', error);
        throw error;
    }
});

ipcMain.handle('list-folder', async (event, folderPath: string) => {
    try {
        // 读取目标文件夹下的文件
        const files = fs.readdirSync(folderPath);

        // 返回每个文件的名称和类型（文件或文件夹）
        return files.map(file => {
            const fullPath = path.join(folderPath, file);
            const stats = fs.statSync(fullPath); // 获取文件信息

            return {
                name: file,
                path: fullPath,
                type: stats.isDirectory() ? 'directory' : 'file',
            };
        });
    } catch (error) {
        console.error('Error reading folder:', error);
        throw error;
    }
});


ipcMain.handle('list-user-folder', async (event, folderPath: string) => {
    try {
        const userDataPath = app.getPath('userData'); // 获取用户数据目录路径
        const targetPath = path.join(userDataPath, 'Projects', folderPath); // 拼接目标文件夹路径

        // 读取目标文件夹下的文件
        const files = fs.readdirSync(targetPath);

        // 返回每个文件的名称和类型（文件或文件夹）
        const fileInfo = files.map(file => {
            const fullPath = path.join(targetPath, file);
            const stats = fs.statSync(fullPath); // 获取文件信息

            return {
                name: file,
                path: fullPath,
                type: stats.isDirectory() ? 'directory' : 'file',
            };
        });

        return fileInfo;
    } catch (error) {
        console.error('Error reading folder:', error);
        throw error;
    }
});

// 判断文件是否存在
ipcMain.handle('user-file-exists', async (event, filePath) => {
    try {
        const userDataPath = app.getPath('userData');
        const fullPath = path.join(userDataPath, 'Projects', filePath);
        return fs.promises.access(fullPath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);
    } catch (error) {
        console.error('检查文件是否存在失败:', error);
        return false;
    }
});


ipcMain.handle("run-mvn-command", async (_event, args: string[],cwd?: string) => {
    return new Promise((resolve, reject) => {
        const mvnProcess = spawn("mvn", args, {
            cwd: cwd , // 设置工作目录，默认为当前目录
            shell: true,
        });

        let output = "";
        mvnProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        mvnProcess.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
        });

        mvnProcess.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(`Maven command failed with code ${code}: ${output}`);
            }
        });
    });
});


ipcMain.handle('dialog:select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0]; // 返回选中的文件夹路径
    }
});
