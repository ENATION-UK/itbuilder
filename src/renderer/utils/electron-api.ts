import {SearchResult} from "hnswlib-node";

export const ElectronAPI = {
    readFile: (filePath: string): Promise<string> => window.electronAPI.readFile(filePath),
    writeFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeFile(filePath, content),

    readAppFile: (filePath: string): Promise<string> => window.electronAPI.readAppFile(filePath),
    writeAppFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeAppFile(filePath, content),

    readUserFile: (filePath: string): Promise<string> => window.electronAPI.readUserFile(filePath),
    writeUserFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeUserFile(filePath, content),
    createUserFolder: (folderPath: string): Promise<string> => window.electronAPI.createUserFolder(folderPath),

    userFileExists: (filePath: string): Promise<boolean> => window.electronAPI.userFileExists(filePath),

    listUserFolder: async (folderPath: string): Promise<{ name: any; path: any; type: any }[]> => {
        const rawFileInfo = await window.electronAPI.listUserFolder(folderPath);
        return rawFileInfo.map((file: any) => ({
            name: file.name,
            path: file.path,
            type: file.type,
            isDirectory() {
                return this.type === 'directory';
            },
            isFile() {
                return this.type === 'file';
            }
        }));
    },

    listFolder: async (folderPath: string): Promise<FileInfo[]> => {
        const rawFileInfo = await window.electronAPI.listFolder(folderPath);
        return rawFileInfo.map((file: any) => ({
            name: file.name,
            path: file.path,
            type: file.type,
            isDirectory() {
                return this.type === 'directory';
            },
            isFile() {
                return this.type === 'file';
            }
        }));
    },
    selectFolder: (): Promise<string> => window.electronAPI.selectFolder(),
    getAppPath: (): Promise<string> => window.electronAPI.getAppPath(),
    getUserDataPath: (): Promise<string> => window.electronAPI.getUserDataPath(),
    pathJoin: (...paths: string[]): Promise<string> => window.electronAPI.pathJoin(...paths),
    runMavenCommand: (args: string[], cwd?: string): Promise<string> => window.electronAPI.runMavenCommand(args, cwd),
    addVector: (id:number, vector:  number[]): Promise<boolean> => window.electronAPI.addVector(id, vector),
    searchVector: ( vector:  number[],k:number): Promise<{ success: boolean; result: SearchResult }> => window.electronAPI.searchVector( vector,k),
    saveIndex: (): Promise<boolean> => window.electronAPI.saveIndex(),
    loadIndex: (): Promise<boolean> => window.electronAPI.loadIndex(),

    // 数据库操作封装
    runQuery: (sql: string, params?: any[] | Record<string, any>): Promise<any> =>
        window.electronAPI.runQuery(sql, params),

    fetchAll: (sql: string, params?: any[] | Record<string, any>): Promise<any[]> =>
        window.electronAPI.fetchAll(sql, params),

    fetchOne: (sql: string, params?: any[] | Record<string, any>): Promise<any> =>
        window.electronAPI.fetchOne(sql, params),
}