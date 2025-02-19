import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    // 读取 __dirname 下的文件（通过主进程执行）
    readAppFile: (filePath: string) => ipcRenderer.invoke('read-app-file', filePath),

    // 写入 __dirname 下的文件（通过主进程执行）
    writeAppFile: (filePath: string, content: string) => ipcRenderer.invoke('write-app-file', filePath, content),

    // 读取 userData 目录下的文件（通过主进程执行）
    readUserFile: (filePath: string) => ipcRenderer.invoke('read-user-file', filePath),

    // 写入 userData 目录下的文件（通过主进程执行）
    writeUserFile: (filePath: string, content: string) => ipcRenderer.invoke('write-user-file', filePath, content),

    // 获取 Electron 应用目录
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    // 判断文件是否存在
    userFileExists: (filePath: string) => ipcRenderer.invoke('user-file-exists', filePath),
    // 获取 userData 目录路径
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path')
});