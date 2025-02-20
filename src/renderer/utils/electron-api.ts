export const ElectronAPI = {
    readFile: (filePath: string): Promise<string> => window.electronAPI.readFile(filePath),
    readAppFile: (filePath: string): Promise<string> => window.electronAPI.readAppFile(filePath),
    writeAppFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeAppFile(filePath, content),

    readUserFile: (filePath: string): Promise<string> => window.electronAPI.readUserFile(filePath),
    writeUserFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeUserFile(filePath, content),

    userFileExists: (filePath: string): Promise<boolean> => window.electronAPI.userFileExists(filePath),

    listUserFolder: async (folderPath: string): Promise<FileInfo[]> => {
        const rawFileInfo = await window.electronAPI.listUserFolder(folderPath);
        return rawFileInfo.map((file: any) => ({
            name: file.name,
            path: file.path,
            type: file.type,
        }));
    },
    getAppPath: (): Promise<string> => window.electronAPI.getAppPath(),
    getUserDataPath: (): Promise<string> => window.electronAPI.getUserDataPath(),
    pathJoin: (...paths: string[]):  Promise<string> => window.electronAPI.pathJoin(...paths)
};