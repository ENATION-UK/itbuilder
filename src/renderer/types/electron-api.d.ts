interface ElectronAPI {
    readAppFile: (filePath: string) => Promise<string>;
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<string>;
    writeAppFile: (filePath: string, content: string) => Promise<string>;
    readUserFile: (filePath: string) => Promise<string>;
    writeUserFile: (filePath: string, content: string | undefined) => Promise<string>;
    createUserFolder: (folderPath: string) => Promise<string>;
    userFileExists: (filePath: string) => Promise<boolean>;
    listUserFolder: (folderPath: string) => Promise<FileInfo[]>;
    listFolder: (folderPath: string) => Promise<FileInfo[]>;
    getAppPath: () => Promise<string>;
    getUserDataPath: () => Promise<string>;
    pathJoin: (...paths: string[]) => Promise<string>;
    runMavenCommand: (args: string[], cwd?: string) => Promise<string>;
    selectFolder: () => Promise<string>;
    addVector: (id, vector) => Promise<boolean>;
    searchVector: (vector, k) => Promise<{ success: boolean, result: SearchResult }>;
    saveIndex: () => Promise<boolean>;
    loadIndex: () => Promise<boolean>;

    // 数据库接口
    runQuery: (sql: string, params?: any[] | Record<string, any>) => Promise<any>;
    fetchAll: (sql: string, params?: any[] | Record<string, any>) => Promise<any[]>;
    fetchOne: (sql: string, params?: any[] | Record<string, any>) => Promise<any>;

    runEmbedding: (text: string | string[]) => Promise<any>;
}

declare interface Window {
    electronAPI: ElectronAPI;
}
