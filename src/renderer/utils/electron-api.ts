export const ElectronAPI = {
    readFile: (filePath: string): Promise<string> => window.electronAPI.readFile(filePath),
    writeFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeFile(filePath, content),

    readAppFile: (filePath: string): Promise<string> => window.electronAPI.readAppFile(filePath),
    writeAppFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeAppFile(filePath, content),

    readUserFile: (filePath: string): Promise<string> => window.electronAPI.readUserFile(filePath),
    writeUserFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeUserFile(filePath, content),
    createUserFolder: (folderPath: string): Promise<string> => window.electronAPI.createUserFolder(folderPath),

    userFileExists: (filePath: string): Promise<boolean> => window.electronAPI.userFileExists(filePath),

    listUserFolder: async (folderPath: string): Promise<FileInfo[]> => {
        const rawFileInfo = await window.electronAPI.listUserFolder(folderPath);
        return rawFileInfo.map((file: any) => ({
            name: file.name,
            path: file.path,
            type: file.type,
        }));
    },

    listFolder: async (folderPath: string): Promise<FileInfo[]> => {
        const rawFileInfo = await window.electronAPI.listFolder(folderPath);
        return rawFileInfo.map((file: any) => ({
            name: file.name,
            path: file.path,
            type: file.type,
        }));
    },
    getAppPath: (): Promise<string> => window.electronAPI.getAppPath(),
    getUserDataPath: (): Promise<string> => window.electronAPI.getUserDataPath(),
    pathJoin: (...paths: string[]):  Promise<string> => window.electronAPI.pathJoin(...paths),
    runMavenCommand:(args: string[], cwd?: string): Promise<string> => window.electronAPI.runMavenCommand( args, cwd)
};