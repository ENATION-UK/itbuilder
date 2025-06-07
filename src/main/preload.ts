import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    //直接读取某文件
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),

    // 读取 __dirname 下的文件（通过主进程执行）
    readAppFile: (filePath: string) => ipcRenderer.invoke('read-app-file', filePath),

    // 写入 __dirname 下的文件（通过主进程执行）
    writeAppFile: (filePath: string, content: string) => ipcRenderer.invoke('write-app-file', filePath, content),

    // 读取 userData 目录下的文件（通过主进程执行）
    readUserFile: (filePath: string) => ipcRenderer.invoke('read-user-file', filePath),

    // 写入 userData 目录下的文件（通过主进程执行）
    writeUserFile: (filePath: string, content: string) => ipcRenderer.invoke('write-user-file', filePath, content),

    createUserFolder: (folderPath: string) => ipcRenderer.invoke('create-user-folder', folderPath),

    listUserFolder: (folderPath: string) => ipcRenderer.invoke('list-user-folder', folderPath),

    listFolder: (folderPath: string) => ipcRenderer.invoke('list-folder', folderPath),

    // 获取 Electron 应用目录
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    // 判断文件是否存在
    userFileExists: (filePath: string) => ipcRenderer.invoke('user-file-exists', filePath),
    // 获取 userData 目录路径
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

    pathJoin: (...paths: string[]) => ipcRenderer.invoke('path-join', ...paths),

    runMavenCommand: ( args: string[], cwd?: string) => ipcRenderer.invoke('run-mvn-command', args, cwd),
    selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),

    // hnswlib
    addVector:  (id:number, vector:  number[]) => ipcRenderer.invoke('hnsw:addVector',  id, vector),
    searchVector:  (vector:  number[],k:number) => ipcRenderer.invoke('hnsw:searchVector',   vector,k),
    saveIndex: () => ipcRenderer.invoke('hnsw:saveIndex'),
    loadIndex: () => ipcRenderer.invoke('hnsw:loadIndex'),

    // 数据库接口
    runQuery: (sql:string, params: any[]) => ipcRenderer.invoke('db:runQuery', sql, params),
    fetchAll: (sql:string, params: any[]) => ipcRenderer.invoke('db:fetchAll', sql, params),
    fetchOne: (sql:string, params: any[]) => ipcRenderer.invoke('db:fetchOne', sql, params),

    // Embedding
    runEmbedding: (text: string | string[]) => ipcRenderer.invoke('transformers:runEmbedding', text)
});

